const express = require('express');
const router = express.Router();

const toDoController = require('../controller/todoController')

router.post('/add', toDoController.addtoDo)
router.get('/', toDoController.getAllTodo)
router.put('/edit/:id', toDoController.updateTodo)
router.delete('/delete/:id', toDoController.deleteTodo)
router.patch('/remove/:id', toDoController.removeTodoItem) 


module.exports = router;