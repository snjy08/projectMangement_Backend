const express = require('express');
const router = express.Router();
const taskController = require('../controller/taskController');

const multer = require('multer');

const upload = multer({ dest: 'uploads/' })

router.post('/add', upload.array('assignedMembers', 5), taskController.addTask);
router.put('/edit/:id', upload.array('assignedMembers', 5),taskController.editTask);
router.get('/', taskController.listTasks);
router.delete('/delete/:id', taskController.deleteTask);
router.get('/getWeek',taskController.getTasksForCurrentWeek)
router.get('/getMonth',taskController.getTasksForCurrentMonth)
router.get('/getYear',taskController.getTasksForYear)
router.get('/notFinishedCount', taskController.getTasksNotFinishedCount);
router.get('/projectList', taskController.getProjectListWithTaskCount);

module.exports = router;
