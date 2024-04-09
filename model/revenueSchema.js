const mongoose = require('mongoose');

const revenueSchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ['sales', 'service', 'interest', 'royalties', 'other'],
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    }
});

const Revenue = mongoose.model('Revenue', revenueSchema);

module.exports = Revenue;
