const Skill = require('../models/SkillModel');

// create a new skill
const createSkill = async (req, res, next) => {
    try {
        const skill = new Skill(req.body);
        await skill.save();
        res.status(201).json({
            success: true,
            message: 'Skill created successfully',
            skill
        });
    } catch (e) {
        next(e);
    }
};

// get all skills
const getSkills = async (req, res, next) => {
    try {
        const skills = await Skill.find().sort({ createdAt: -1 });
        res.status(200).json({ success: true, skills });
    } catch (e) {
        next(e);
    }
};

// update a skill
const updateSkill = async (req, res, next) => {
    try {
        const skill = await Skill.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!skill) {
            return res.status(404).json({ success: false, message: 'Skill not found' });
        }
        res.status(200).json({
            success: true,
            message: 'Skill updated successfully',
            skill
        });
    } catch (e) {
        next(e);
    }
};

// delete skill
const deleteSkill = async (req, res, next) => {
    try {
        const skill = await Skill.findByIdAndDelete(req.params.id);
        if (!skill) {
            return res.status(404).json({ success: false, message: 'Skill not found' });
        }
        res.status(200).json({
            success: true,
            message: 'Skill Deleted successfully',
            skill
        });
    } catch (e) {
        next(e);
    }
};

module.exports = {
    createSkill,
    getSkills,
    updateSkill,
    deleteSkill
};
