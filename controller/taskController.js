const Task = require('../model/taskSchema');
const Project = require('../model/projectSchema');



const { startOfMonth, endOfMonth } = require('date-fns');

const { startOfYear, endOfYear } = require('date-fns');


exports.addTask = async (req, res) => {


    const taskData = req.body

    try {


        const task = new Task(taskData);


        if (req.files) {
            task.assignedMembers = req.files.map(file => ({
                name: file.originalname,
                image: file.path
            }));
        }



        await task.save();


        res.status(201).send(task);
    } catch (error) {

        console.error('Error adding task:', error);
        res.status(400).send(error);
    }
};


exports.editTask = async (req, res) => {
    const taskId = req.params.id;
    try {
        const task = await Task.findById(taskId);
        if (!task) {
            return res.status(404).send("Task not found");
        }


        task.taskName = req.body.taskName || task.taskName;
        task.projectName = req.body.projectName || task.projectName;
        task.status = req.body.status || task.status;
        task.progress = req.body.progress || task.progress;
        task.startDate = req.body.startDate || task.startDate;
        task.endDate = req.body.endDate || task.endDate;
        task.tags = req.body.tags || task.tags;
        task.priority = req.body.priority || task.priority;
        task.inputchecked = req.body.inputchecked || task.inputchecked


        if (req.files && req.files.length > 0) {
            task.assignedMemberImages = req.files.map(file => ({ name: file.originalname, image: file.path }));
        }

        const updatedTask = await task.save();
        res.status(200).send(updatedTask);
    } catch (err) {
        console.error(err);
        res.status(500).send("Internal Server Error");
    }
};


exports.listTasks = async (req, res) => {
    try {

        const tasks = await Task.find({});

        const statusCounts = {
            'Pending': 0,
            'InProgress': 0,
            'Completed': 0,
            'Testing': 0
        };


        const counts = await Task.aggregate([
            { $unwind: '$status' },
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 }
                }
            }
        ]);

        counts.forEach(status => {
            statusCounts[status._id] = status.count;
        });


        res.status(200).send({ data: tasks, counts: statusCounts });
    } catch (error) {
        res.status(500).send(error);
    }
};

exports.deleteTask = async (req, res) => {
    try {
        const task = await Task.findByIdAndDelete(req.params.id);

        if (!task) {
            return res.status(404).send();
        }

        res.status(200).json('Task Deleted')
    } catch (error) {
        res.status(500).send(error);
    }
};
const { startOfWeek, endOfWeek } = require('date-fns');

exports.getTasksForCurrentWeek = async (req, res) => {
    try {

        const startDate = startOfWeek(new Date(), { weekStartsOn: 1 });
        const endDate = endOfWeek(new Date(), { weekStartsOn: 1 });


        const tasks = await Task.find({ startDate: { $gte: startDate }, endDate: { $lte: endDate } });

        res.status(200).json(tasks);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch tasks for the current week' });
    }
};



exports.getTasksForCurrentMonth = async (req, res) => {
    try {
        const startDate = startOfMonth(new Date());
        const endDate = endOfMonth(new Date());

        const tasks = await Task.find({ startDate: { $gte: startDate }, endDate: { $lte: endDate } });

        res.status(200).json(tasks);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch tasks for the current month' });
    }
};

exports.getTasksForYear = async (req, res) => {
    try {
        const tasksByYear = {};

        for (let year = 2020; year <= 2025; year++) {
            const startDate = startOfYear(new Date(year, 0, 1));
            const endDate = endOfYear(new Date(year, 11, 31));

            const tasks = await Task.find({ startDate: { $gte: startDate }, endDate: { $lte: endDate } });

            tasksByYear[year] = tasks;
        }

        res.status(200).json(tasksByYear);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch tasks for each year' });
    }
};

exports.getTasksNotFinishedCount = async (req, res) => {
    try {

        const tasksNotFinished = await Task.find({ status: { $in: ['InProgress', 'Testing', 'Pending'] } });


        const tasksNotFinishedCount = tasksNotFinished.length;


        res.status(200).json({ tasksNotFinishedCount });
    } catch (error) {
        console.error('Error fetching tasks not finished count:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

exports.getProjectListWithTaskCount = async (req, res) => {
    try {
        const projects = await Project.find({ status: { $in: ['Testing', 'InProgress'] } });

        const projectListWithTaskCount = [];

        for (const project of projects) {
            const totalTaskCount = await Task.countDocuments({ projectName: project.projectName });
            const completedTaskCount = await Task.countDocuments({ projectName: project.projectName, status: 'Completed' });

            const projectWithTaskCount = {
                projectName: project.projectName,
                totalTaskCount: totalTaskCount,
                icon: project.uploadedImages[0],
                completedTaskCount: completedTaskCount
            };

            projectListWithTaskCount.push(projectWithTaskCount);
        }

        res.status(200).json(projectListWithTaskCount);
    } catch (error) {
        console.error('Error fetching project list with task count:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
