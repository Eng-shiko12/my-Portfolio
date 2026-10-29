const mongoose = require('mongoose');

const ProjectSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true
    },
    imageUrl: {
        type: String,
        required: true
    },
    technology: {
        type: [String],
        default: []
    },
    githubUrl: {
        type: String,
        required: false,
        default: ''
    },
    liveUrl: {
        type: String,
        required: false,
        default: ''
    }
}, {
    timestamps: true
});

const Project = mongoose.model('Project', ProjectSchema);
module.exports = Project;
