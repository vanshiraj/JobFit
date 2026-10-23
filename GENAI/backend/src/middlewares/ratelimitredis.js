const Redis = require('ioredis');

const redis = new Redis(process.env.REDIS_URL || {
    host: process.env.REDIS_HOST || 'localhost',
    port: Number(process.env.REDIS_PORT) || 6379,
    retryStrategy(times) {
        return Math.min(times * 100, 3000);
    }
});

redis.on('error', (err) => {
    console.error('Redis ratelimit connection error:', err.message);
});

const ratelimitter = async (req, res, next) => {
    try {
        const ip = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
        const maxRequests = 15;
        const timeWindow = 60; // 1 minute
        const key = `ratelimit:${ip}`;

        const currentRequests = await redis.incr(key);
        if (currentRequests > maxRequests) {
            return res.status(429).json({ message: 'Too many requests. Please try again in a minute.' });
        }
        if (currentRequests === 1) {
            await redis.expire(key, timeWindow);
        }
        next();
    } catch (error) {
        console.error('Error in rate limit middleware:', error.message);
        // Fail open so users aren't locked out if cache has a temporary blip
        next();
    }
};

module.exports = { ratelimitter };