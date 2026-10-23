
const usermodel = require('../model/user.model');
const blacklistmodel = require('../model/blacklist.model');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const Redis = require('ioredis');

dotenv.config();

const redis = new Redis(process.env.REDIS_URL || {
    host: process.env.REDIS_HOST || 'localhost',
    port: Number(process.env.REDIS_PORT) || 6379,
    retryStrategy(times) {
        return Math.min(times * 100, 3000);
    }
});

redis.on('error', (err) => {
    console.error('Redis auth connection error:', err.message);
});

async function registerUser(req, res) {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({
            message: 'Name, email, and password are required'
        });
    }

    try {
        const existingUser = await usermodel.User.findOne({
            $or: [{ email }, { name }]
        });

        if (existingUser) {
            return res.status(400).json({
                message: 'User already exists'
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await usermodel.User.create({
            name,
            email,
            password: hashedPassword
        });

        try {
            await redis.del('allusers');
        } catch (redisErr) {
            console.error('Redis cache clear error:', redisErr.message);
        }

        const jwtSecret = process.env.JWT_SECRET;

        if (!jwtSecret) {
            console.error('JWT_SECRET is not configured');

            return res.status(500).json({
                message: 'Internal server error'
            });
        }

        const token = jwt.sign(
            {
                userId: user._id,
                username: user.name
            },
            jwtSecret,
            { expiresIn: '1d' }
        );

        res.cookie('token', token, {
            httpOnly: true,
            sameSite: 'lax',
            secure: false,
            maxAge: 24 * 60 * 60 * 1000
        });

        return res.status(201).json({
            message: 'User registered successfully',
            user: {
                id: user._id,
                name: user.name,
                email: user.email
            }
        });
    } catch (error) {
        console.error('REGISTER ERROR:', error);

        return res.status(500).json({
            message: 'Internal server error'
        });
    }
}

async function loginUser(req, res) {
    const { emailOrName, password } = req.body || {};

    // Temporary debugging: never log the password itself.
    console.log('Login identifier received:', emailOrName);
    console.log('Password provided:', Boolean(password));

    if (!emailOrName || !password) {
        return res.status(400).json({
            message: 'Email/name and password are required'
        });
    }

    try {
        const user = await usermodel.User.findOne({
            $or: [
                { email: emailOrName },
                { name: emailOrName }
            ]
        });

        console.log('User found in MongoDB:', Boolean(user));

        if (!user) {
            return res.status(400).json({
                message: 'Invalid credentials 1'
            });
        }

        const isPasswordValid = await bcrypt.compare(
            password,
            user.password
        );

        if (!isPasswordValid) {
            return res.status(400).json({
                message: 'Invalid email or password'
            });
        }

        const jwtSecret = process.env.JWT_SECRET;

        if (!jwtSecret) {
            console.error('JWT_SECRET is not configured');

            return res.status(500).json({
                message: 'Internal server error'
            });
        }

        const token = jwt.sign(
            {
                userId: user._id,
                username: user.name
            },
            jwtSecret,
            { expiresIn: '1d' }
        );

        res.cookie('token', token, {
            httpOnly: true,
            sameSite: 'lax',
            secure: false,
            maxAge: 24 * 60 * 60 * 1000
        });

        return res.status(200).json({
            message: 'Login successful',
            user: {
                id: user._id,
                name: user.name,
                email: user.email
            },
            token
        });
    } catch (error) {
        console.error('LOGIN ERROR:', error);

        return res.status(500).json({
            message: 'Internal server error'
        });
    }
}

async function logoutUser(req, res) {
    try {
        const authHeader = req.headers.authorization;
        const bearerToken = authHeader && authHeader.startsWith("Bearer ") ? authHeader.split(" ")[1] : null;
        const token = req.cookies?.token || bearerToken;

        if (!token) {
            return res.status(400).json({
                message: 'No token found'
            });
        }

        await blacklistmodel.create({ token });

        res.clearCookie('token', {
            httpOnly: true,
            sameSite: 'lax',
            secure: false
        });

        return res.status(200).json({
            message: 'Logout successful'
        });
    } catch (error) {
        console.error('LOGOUT ERROR:', error);

        return res.status(500).json({
            message: 'Internal server error'
        });
    }
}

async function getMe(req, res) {
    try {
        const user = await usermodel.User.findById(req.user.userId);

        if (!user) {
            return res.status(404).json({
                message: 'User not found'
            });
        }

        return res.status(200).json({
            message: 'User fetched successfully',
            user: {
                id: user._id,
                name: user.name,
                email: user.email
            }
        });
    } catch (error) {
        console.error('GET USER ERROR:', error);

        return res.status(500).json({
            message: 'Internal server error'
        });
    }
}

async function getMeredis(req, res) {
    try {
        const cacheKey = `user:${req.user.userId}`;
        const cached = await redis.get(cacheKey);

        if (cached) {
            return res.status(200).json({
                message: 'User fetched successfully from Redis',
                user: JSON.parse(cached)
            });
        }

        const user = await usermodel.User.findById(req.user.userId);

        if (!user) {
            return res.status(404).json({
                message: 'User not found'
            });
        }

        const userData = {
            id: user._id,
            name: user.name,
            email: user.email
        };

        await redis.set(
            cacheKey,
            JSON.stringify(userData),
            'EX',
            86400
        );

        return res.status(200).json({
            message: 'User fetched successfully from MongoDB',
            user: userData
        });
    } catch (error) {
        console.error('GET USER REDIS ERROR:', error);

        return res.status(500).json({
            message: 'Internal server error'
        });
    }
}

async function getallusers(req, res) {
    try {
        const users = await usermodel.User.find();

        return res.status(200).json({
            message: 'Users fetched successfully',
            users: users.map(user => ({
                id: user._id,
                name: user.name,
                email: user.email
            }))
        });
    } catch (error) {
        console.error('GET ALL USERS ERROR:', error);

        return res.status(500).json({
            message: 'Internal server error'
        });
    }
}

async function getallusersbyredis(req, res) {
    try {
        const cacheKey = 'allusers';
        const cached = await redis.get(cacheKey);

        if (cached) {
            return res.status(200).json({
                message: 'Users fetched successfully from Redis',
                users: JSON.parse(cached)
            });
        }

        const users = await usermodel.User.find();

        const userData = users.map(user => ({
            id: user._id,
            name: user.name,
            email: user.email
        }));

        await redis.set(
            cacheKey,
            JSON.stringify(userData),
            'EX',
            86400
        );

        return res.status(200).json({
            message: 'Users fetched successfully from MongoDB',
            users: userData
        });
    } catch (error) {
        console.error('GET ALL USERS REDIS ERROR:', error);

        return res.status(500).json({
            message: 'Internal server error'
        });
    }
}

module.exports = {
    registerUser,
    loginUser,
    logoutUser,
    getMe,
    getMeredis,
    getallusers,
    getallusersbyredis
};
