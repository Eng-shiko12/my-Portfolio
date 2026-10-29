const Experience = require('../models/experienceModel');

const createExperience = async (req, res, next) => {
    try {
        const experience = new Experience(req.body);
        await experience.save();
        res.status(201).json({
            success: true,
            message: 'Experience added successfully',
            experience
        });
    } catch (e) {
        next(e);
    }
};

const getExperience = async (req, res, next) => {
    try {
        const experiences = await Experience.find().sort({ createdAt: -1 });
        res.status(200).json({
            success: true,
            experiences
        });
    } catch (e) {
        next(e);
    }
};

const updateExperience = async (req, res, next) => {
    try {
        const experience = await Experience.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });

        if (!experience) {
            return res.status(404).json({ success: false, message: 'Experience not found' });
        }

        // The client reads "experience", so use the same key as create
        res.status(200).json({
            success: true,
            message: 'Experience is updated',
            experience
        });
    } catch (e) {
        next(e);
    }
};

const deleteExperience = async (req, res, next) => {
    try {
        const exp = await Experience.findByIdAndDelete(req.params.id);

        if (!exp) {
            return res.status(404).json({ success: false, message: 'Experience not found' });
        }

        res.status(200).json({ success: true, message: 'Experience is deleted' });
    } catch (e) {
        next(e);
    }
};

module.exports = {
    createExperience,
    getExperience,
    updateExperience,
    deleteExperience
};
