const Admin = require('../models/adminModel');
const jwt = require('jsonwebtoken');

const Auth = async (req, res, next) => {
    try {
        const authHeader = req.header('Authorization');
        if (!authHeader) {
            return res.status(401).json({ success: false, error: 'Authentication required' });
        }

        const token = authHeader.replace('Bearer', '').trim();
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const admin = await Admin.findOne({ _id: decoded.id, tokens: token });
        if (!admin) {
            return res.status(401).json({ success: false, error: 'Session is no longer valid' });
        }

        req.admin = admin;
        req.token = token;
        next();
    } catch (e) {
        // Invalid or expired token is a 401, not a server error
        if (e.name === 'JsonWebTokenError' || e.name === 'TokenExpiredError') {
            return res.status(401).json({ success: false, error: 'Invalid or expired token' });
        }
        next(e);
    }
};

module.exports = Auth;
