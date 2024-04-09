const mongoose = require('mongoose');

const todoSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    content :{
        type: String,
        required: true
    },
    completed: {
        type: Boolean,
        default: false,
    }
    ,
    completionTime: {
        type: Date,
    },
    removeItem:{
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const Todo = mongoose.model('Todo', todoSchema);

module.exports = Todo;