const Redis = require('ioredis');

const redisConfig = process.env.REDIS_URL || (
    process.env.REDIS_HOST || process.env.REDIS_PORT
        ? {
            host: process.env.REDIS_HOST || 'localhost',
            port: Number(process.env.REDIS_PORT) || 6379,
            retryStrategy(times) {
                return Math.min(times * 100, 3000);
            }
        }
        : null
);
const redis = redisConfig ? new Redis(redisConfig) : null;

if (redis) {
    redis.on('error', (err) => {
        console.error('Redis rate-limit connection error:', err.message);
    });
}

const ratelimitter = async (req, res, next) => {
    if (!redis) return next();
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