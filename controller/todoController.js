const Todo = require('../model/toDoSchema');

const addtoDo = async (req, res, next) => {
    const { title,content, completionTime } = req.body;

  
    const currentTime = new Date();
    const selectedTime = new Date(completionTime);

    if (selectedTime <= currentTime) {
        return res.status(400).json({ message: 'Completion time must be today or in the future' });
    }

    try {
        const todo = new Todo({
            title,
            content,
            completionTime,
        });
        await todo.save();
        res.status(201).json(todo);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


const getAllTodo = async (req, res, next) => {
    try {
        const todos = await Todo.find();
        res.status(200).json(todos);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

const updateTodo = async (req, res, next) => {
    try {
        const updatedTodo = await Todo.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(updatedTodo);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
}

const deleteTodo = async (req, res) => {
    try {
        await Todo.findByIdAndDelete(req.params.id);
        res.json({ message: 'Todo deleted successfully' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
}

const removeTodoItem = async (req, res) => {
    try {
        const { id } = req.params;
        

        await Todo.findByIdAndUpdate(id, { removeItem: true });
        res.status(200).json({ message: "Updated" });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}
module.exports = {
    addtoDo,
    getAllTodo,
    updateTodo,
    deleteTodo,
    removeTodoItem
}