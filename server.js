const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

dotenv.config();

const errorHandler = require('./server/middleware/errorMiddleware');
const authRoutes = require('./server/routes/authRoutes');
const projectRoutes = require('./server/routes/projectRoutes');
const skillRoutes = require('./server/routes/skillRoutes');
const experienceRoutes = require('./server/routes/experienceRoutes');
const bioRoutes = require('./server/routes/bioRoutes');
const messageRoutes = require('./server/routes/messageRoutes');

const app = express();

// Required on Vercel so rate limiting sees the real client IP
app.set('trust proxy', 1);

app.use(helmet());

// Only the exact frontend URL is allowed (no wildcard *.vercel.app)
const allowedOrigins = [
    process.env.FRONTEND_URL ? process.env.FRONTEND_URL.replace(/\/$/, '') : null,
    'http://localhost:5173',
    'http://localhost:3000'
].filter(Boolean);

app.use(cors({
    origin: function (origin, callback) {
        if (!origin) return callback(null, true);
        if (allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true
}));
app.use(express.json({ limit: '10kb' }));

// Remove Mongo operators ($...) and dotted keys from the body
app.use((req, res, next) => {
    if (req.body) {
        const sanitizeData = (obj) => {
            for (let key in obj) {
                if (key.startsWith('$') || key.includes('.')) {
                    delete obj[key];
                } else if (typeof obj[key] === 'object' && obj[key] !== null) {
                    sanitizeData(obj[key]);
                }
            }
        };
        sanitizeData(req.body);
    }
    next();
});

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: { success: false, error: 'Too many requests from this IP, please try again after 15 minutes' }
});

const messageLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    max: 5,
    message: { success: false, error: 'Too many messages, please try again later.' }
});

app.use('/api/auth', authLimiter);
app.use('/api/messages/message', messageLimiter);

app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/skills', skillRoutes);
app.use('/api/experience', experienceRoutes);
app.use('/api/bio', bioRoutes);
app.use('/api/messages', messageRoutes);

app.get('/', (req, res) => {
    res.status(200).json({ success: true, message: 'Portfolio Backend is running successfully!' });
});

app.use(errorHandler);

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

mongoose.connect(MONGO_URI)
    .then(() => console.log('Database Connected Successfully'))
    .catch((err) => console.error('Database connection failed:', err.message));

if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
}

module.exports = app;
