// Task model schema
const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
    taskNo: {
        type: Number,
        required: true
    },
    taskName: {
        type: String,
        required: true
    },
    assignedMembers:  [{
        name: String, 
        image: String 
    }],
    projectName: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['Pending', 'InProgress', 'Complete', 'Testing'],
        required: true
    },
    progress: {
        type: Number,
        default: 0
    },
    startDate: {
        type: Date,
        required: true
    },
    endDate: {
        type: Date,
        required: true
    },
    tags: {
        type: [String],
        default: []
    },
    priority: {
        type: String,
        enum: ['High', 'Medium', 'Low'],
        default: 'Medium'
    },
    inputchecked: {
        type: Boolean,
        default: false
    }
});

const Task = mongoose.model('Task', taskSchema);

module.exports = Task;
