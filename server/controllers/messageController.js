const Message = require('../models/messageModel');
const nodemailer = require('nodemailer');
const validator = require('validator');

// Created once and reused
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

const createMessage = async (req, res, next) => {
    try {
        const name = String(req.body.name || '').trim();
        const email = String(req.body.email || '').trim();
        const message = String(req.body.message || '').trim();

        if (!name || name.length > 100) {
            return res.status(400).json({ success: false, error: 'Name is required (max 100 characters)' });
        }
        if (!validator.isEmail(email)) {
            return res.status(400).json({ success: false, error: 'Please enter a valid email' });
        }
        if (!message || message.length > 2000) {
            return res.status(400).json({ success: false, error: 'Message is required (max 2000 characters)' });
        }

        const newMessage = new Message({ name, email, message });
        await newMessage.save();

        // A mail failure must not fail the request: the message is already saved
        try {
            await transporter.sendMail({
                from: process.env.EMAIL_USER,
                replyTo: email,
                to: process.env.EMAIL_USER,
                subject: `New Portfolio Message from ${name}`,
                text: `Name: ${name}\nEmail: ${email}\n\n${message}`
            });
        } catch (mailErr) {
            console.error('Mail failed:', mailErr.message);
        }

        res.status(201).json({
            success: true,
            message: 'Message sent and saved successfully',
            data: newMessage
        });
    } catch (e) {
        next(e);
    }
};

const getMessage = async (req, res, next) => {
    try {
        const messages = await Message.find().sort({ createdAt: -1 });
        res.status(200).json({
            success: true,
            count: messages.length,
            messages
        });
    } catch (e) {
        next(e);
    }
};

const updateStatus = async (req, res, next) => {
    try {
        const message = await Message.findById(req.params.id);

        if (!message) {
            return res.status(404).json({ success: false, message: 'Message not exist' });
        }

        message.isRead = true;
        await message.save();

        res.status(200).json({
            success: true,
            text: 'Status updated successfully',
            message
        });
    } catch (e) {
        next(e);
    }
};

const deleteMessage = async (req, res, next) => {
    try {
        const message = await Message.findByIdAndDelete(req.params.id);

        if (!message) {
            return res.status(404).json({ success: false, message: 'Message not exist' });
        }

        res.status(200).json({ success: true, message: 'Message is deleted' });
    } catch (e) {
        next(e);
    }
};

module.exports = {
    createMessage,
    getMessage,
    updateStatus,
    deleteMessage
};
