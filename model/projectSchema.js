const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
    projectLeadName: {
        type: String
    },
    teamLeaderName: {
        type: String,
        required: true
    },
    otherGroupMembers: [{
        name: String, 
        image: String 
    }],
    projectName: {
        type: String,
        required: true
    },
    startDate: {
        type: String
    },
    endDate: {
        type: String

    },
    clientName: {
        type: String,
        required: true
    },
    depositedAmount: {
        type: Number,
        required: true
    },
    uploadedImages:  [{
        name: String, 
        image: String 
    }],
    uploadedFiles: [{
        name: String, 
        image: String 
    }],
    description: {
        type: String
    },
    status: {
        type: String,
        default: 'Pending'
    },
    theme: {
        type: String,
        default: 'danger'
    },
    referenceNumber: {
        type: String
    },
    orderNumber: {
        type: Number
    },
    createdAt: {
        type: Date
    }
});

module.exports = mongoose.model('Project', projectSchema);
