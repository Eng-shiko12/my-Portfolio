const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const validation = require('validator');
const bcryptjs = require('bcryptjs');

const adminSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        validate(email) {
            if (!validation.isEmail(email)) {
                throw new Error('this email is not valid');
            }
        }
    },
    password: {
        type: String,
        required: true,
        validate(value) {
            if (value.startsWith('$2a$') || value.startsWith('$2b$')) return;

            const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
            if (!passwordRegex.test(value)) {
                throw new Error('This password is not valid');
            }
        },
        select: false
    },
    role: {
        type: String,
        default: 'admin'
    },
    tokens: [
        {
            type: String,
            required: true
        }
    ]
});

// Generate a token that expires in 7 days, and keep only the last 5 sessions
adminSchema.methods.generateTokens = async function () {
    const admin = this;
    const token = jwt.sign({ id: admin._id.toString() }, process.env.JWT_SECRET, { expiresIn: '7d' });
    admin.tokens = [...admin.tokens.slice(-4), token];
    await admin.save();
    return token;
};

// Hash password
adminSchema.pre('save', async function () {
    const admin = this;
    if (admin.isModified('password')) {
        if (!admin.password.startsWith('$2a$') && !admin.password.startsWith('$2b$')) {
            admin.password = await bcryptjs.hash(admin.password, 10);
        }
    }
});

// Login
adminSchema.statics.findByCredentials = async function (email, password) {
    const admin = await this.findOne({ email }).select('+password');
    if (!admin) {
        throw new Error('Invalid email or password');
    }
    const isMatch = await bcryptjs.compare(password, admin.password);
    if (!isMatch) {
        throw new Error('Invalid email or password');
    }
    return admin;
};

const Admin = mongoose.model('Admin', adminSchema);
module.exports = Admin;
