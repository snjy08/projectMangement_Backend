const express = require("express")

const mongoose = require("mongoose")

const multer = require('multer');

const cors = require('cors')

const server = express()

server.use(cors())

server.use(express.json())

const projectRouter = require('./router/project-router')
server.use('/project',  projectRouter)


const taskRouter = require('./router/task-router')
server.use('/task',taskRouter)

const socialRouter = require('./router/social-router')
server.use('/social',socialRouter)

const expenseRouter = require('./router/expense-router')
server.use('/expense',expenseRouter)

const eventRouter = require('./router/event-router')
server.use('/events',eventRouter)

const toDoRouter = require('./router/toDo-router')
server.use('/todos',toDoRouter)

const revenueRouter = require('./router/revenue-router')
server.use('/revenue',revenueRouter)

server.use('/uploads', express.static('uploads'));
server.use(express.urlencoded({ extended: true }));


server.use((req, res, next) => {
    const error = new HttpError('Could not find this route ', 404)
    throw error;
})

const PORT = 4000 || process.env.PORT

server.use((error, req, res, next) => {
    if (res.headerSent) {
        return next(error);
    }
    res.status(error.code || 500)
    res.json({ message: error.message || 'An unknown error occurred!' });
})


// Error handling middleware for Multer errors
server.use((err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        // Handle Multer errors
        if (err.code === 'LIMIT_UNEXPECTED_FILE') {
            res.status(400).json({ message: 'Too many files uploaded', error: err.message });
        } else {
            res.status(400).json({ message: 'Multer error', error: err.message });
        }
    } else {
        // Handle other errors
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

mongoose.connect('mongodb+srv://malavikavenu914:snjy5678@cluster0.8duiran.mongodb.net/projectManagement?retryWrites=true&w=majority', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    server.listen(PORT, () => {
        console.log(`Server running at Port ${PORT}`);
        console.log('MongoDB connected successfully')
    })

}).catch((err) => {
    console.log(err);
})

