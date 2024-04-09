const mongoose = require('mongoose');

const socialMediaSchema = new mongoose.Schema({
    platformName: {
        type: String,
        required: true
    },
    followersCount: {
        type: Number,
        required: true
    },
    postId: {
        type: String,
        required: true,
        unique: true
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('SocialMedia', socialMediaSchema);
