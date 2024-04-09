const Project = require('../model/projectSchema');

//Add Project
// Update the addProject controller function
exports.addProject = async (req, res) => {
    try {
        const referenceNumber = generateRandomReferenceNumber();
        const orderNumber = await generateOrderNumber();
        console.log(req.files['otherGroupMembers'])


        const { projectLeadName, teamLeaderName, projectName, startDate, endDate, clientName, depositedAmount, description } = req.body;
        const otherGroupMembers = req.files['otherGroupMembers'] ? req.files['otherGroupMembers'].map(file => ({ name: file.originalname, image: file.path })) : [];
        const uploadedImages = req.files['uploadedImages'] ? req.files['uploadedImages'].map(file => ({ name: file.originalname, image: file.path })) : [];
        const uploadedFiles = req.files['uploadedFiles'] ? req.files['uploadedFiles'].map(file => ({ name: file.originalname, image: file.path })) : [];

        const project = new Project({
            projectLeadName,
            teamLeaderName,
            otherGroupMembers: otherGroupMembers.length > 0 ? otherGroupMembers : [], // Ensure otherGroupMembers is initialized as an empty array if no group members are provided
            projectName,
            startDate,
            endDate,
            clientName,
            depositedAmount,
            uploadedImages,
            uploadedFiles,
            description,
            createdAt: startDate, // Use startDate as createdAt
            referenceNumber,
            orderNumber
        });

        const savedProject = await project.save();
        res.status(201).send(savedProject);
    } catch (err) {
        console.error('Failed to add project:', err);
        res.status(400).send({ message: 'Failed to add project' });
    }
};



// Function to generate a random reference number
function generateRandomReferenceNumber() {
    const prefix = 'HA';
    const min = 10000;
    const max = 99999;
    const randomNum = Math.floor(Math.random() * (max - min + 1)) + min;
    return `${prefix}-${randomNum}`;
}


// Function to generate an order number
async function generateOrderNumber() {
    try {

        const projectsCount = await Project.countDocuments();
        return projectsCount + 1;
    } catch (err) {
        console.error("Error generating order number:", err);

        return null;
    }
}
// Detailed view of each project
exports.getAParticularProject = async (req, res) => {
    const projectId = req.params.projectId;
    try {
        const project = await Project.findById(projectId);
        if (!project) {
            return res.status(404).send("Project not found");
        }
        res.status(200).send(project);
    } catch (err) {
        res.status(500).send(err);
    }
}

// List of all Projects
exports.getAllProjects = async (req, res) => {
    try {

        let projects;
        if (req.query.projectName) {
            projects = await Project.find({ projectName: { $regex: req.query.projectName, $options: 'i' } });
        } else {
            projects = await Project.find();
        }


        const counts = await Project.aggregate([
            { $unwind: '$status' },
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 }
                }
            }
        ]);


        const statusCounts = {};


        counts.forEach(status => {
            statusCounts[status._id] = status.count;
        });


        const getStatusCount = status => statusCounts[status] || 0;

        const allStatusCounts = {
            pending: getStatusCount('Pending'),
            inProgress: getStatusCount('InProgress'),
            testing: getStatusCount('Testing'),
            complete: getStatusCount('Complete')
        };

        res.status(200).send({ data: projects, counts: allStatusCounts });
    } catch (err) {
        console.error('Failed to get all projects:', err);
        res.status(500).send('Failed to get all projects');
    }
};



// Edit Project
exports.editProject = async (req, res) => {

    const projectId = req.params.projectId;
    try {
        const project = await Project.findById(projectId);
        if (!project) {
            return res.status(404).send("Project not found");
        }

        project.projectLeadName = req.body.projectLeadName || project.projectLeadName;
        project.teamLeaderName = req.body.teamLeaderName || project.teamLeaderName;
        project.projectName = req.body.projectName || project.projectName;
        project.startDate = req.body.startDate || project.startDate;
        project.endDate = req.body.endDate || project.endDate;
        project.clientName = req.body.clientName || project.clientName;
        project.depositedAmount = req.body.depositedAmount || project.depositedAmount;
        project.description = req.body.description || project.description;





        if (req.body.status) {
            project.status = req.body.status;

            switch (req.body.status) {
                case 'Complete':
                    project.theme = 'success';
                    break;
                case 'InProgress':
                    project.theme = 'purple';
                    break;
                case 'Testing':
                    project.theme = 'warning';
                    break;
                case 'Pending':
                default:
                    project.theme = 'danger';
                    break;
            }
        }

        if (req.files && req.files['uploadedImages'] && req.files['uploadedImages'].length > 0) {
            project.uploadedImages = req.files['uploadedImages'].map(file => ({ name: file.originalname, image: file.path }))
        }

        if (req.files && req.files['uploadedFiles'] && req.files['uploadedFiles'].length > 0) {
            project.uploadedFiles = req.files['uploadedFiles'].map(file => ({ name: file.originalname, image: file.path }))
        }
        if (req.files && req.files['otherGroupMembers'] && req.files['otherGroupMembers'].length > 0) {
            project.otherGroupMembers = req.files['otherGroupMembers'].map(file => ({ name: file.originalname, image: file.path }))
        }
        const updatedProject = await project.save();
        res.status(200).send(updatedProject);
    } catch (err) {
        if (err.name === 'ValidationError') {
            return res.status(400).send(err.message);
        }
        res.status(500).send("Internal Server Error");
    }
};


// Delete Project
exports.deletedProject = async (req, res) => {
    const projectId = req.params.projectId;
    try {
        const deletedProject = await Project.findByIdAndDelete(projectId);
        if (!deletedProject) {
            return res.status(404).send("Project not found");
        }
        res.status(200).send("Project deleted successfully");
    } catch (err) {
        res.status(500).send(err);
    }
}


//Function to get active projects in a week
exports.getActiveProjectsByWeekInMonth = async (req, res) => {



    try {
        const currentYear = new Date().getFullYear();
        const currentMonth = new Date().getMonth() + 1;
        const daysInMonth = new Date(currentYear, currentMonth, 0).getDate();
        const firstDayOfMonth = new Date(currentYear, currentMonth - 1, 1);
        const lastDayOfMonth = new Date(currentYear, currentMonth - 1, daysInMonth);


        const isoWeekFirstDayOfMonth = getISOWeek(firstDayOfMonth);
        const isoWeekLastDayOfMonth = getISOWeek(lastDayOfMonth);


        const totalWeeksInMonth = isoWeekLastDayOfMonth - isoWeekFirstDayOfMonth + 1;


        const activeProjectsByMonthWeek = {
            activeProjectsByWeek: {}
        };


        for (let i = 1; i <= totalWeeksInMonth; i++) {
            activeProjectsByMonthWeek.activeProjectsByWeek[`Week${i}`] = 0;
        }


        const activeProjectsInMonth = await Project.find({
            status: { $in: ['InProgress', 'Testing'] },
            createdAt: { $gte: firstDayOfMonth, $lte: lastDayOfMonth }
        });


        activeProjectsInMonth.forEach(project => {
            const isoWeekProject = getISOWeek(project.createdAt);
            const weekNumber = isoWeekProject - isoWeekFirstDayOfMonth + 1;
            if (weekNumber >= 1 && weekNumber <= totalWeeksInMonth) {
                activeProjectsByMonthWeek.activeProjectsByWeek[`Week${weekNumber}`]++;
            }
        });

        res.status(200).json(activeProjectsByMonthWeek);
    } catch (error) {
        console.error('Error fetching active projects by month and week:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }


};


// Function to get weeks in a month
function getWeeksInMonth(year, month) {
    const weeks = [];
    const firstDate = new Date(year, month, 1);
    const lastDate = new Date(year, month + 1, 0);
    let currentDate = new Date(firstDate);
    let week = [];

    while (currentDate <= lastDate) {
        if (currentDate.getDay() === 0 && week.length > 0) {
            weeks.push(week);
            week = [];
        }
        week.push(new Date(currentDate));
        currentDate.setDate(currentDate.getDate() + 1);
    }

    if (week.length > 0) {
        weeks.push(week);
    }

    return weeks;
}

exports.getActiveProjectsByMonth = async (req, res) => {
    try {
        const currentDate = new Date();
        const currentYear = currentDate.getFullYear();
        const activeProjectsByMonth = {};


        for (let month = 0; month < 12; month++) {
            const startOfMonth = new Date(currentYear, month, 1);
            const endOfMonth = new Date(currentYear, month + 1, 0);


            const activeProjectsCount = await Project.countDocuments({
                status: { $in: ['Testing', 'InProgress'] },
                createdAt: { $gte: startOfMonth, $lte: endOfMonth }
            });

            activeProjectsByMonth[new Date(currentYear, month).toLocaleString('default', { month: 'short' })] = activeProjectsCount;
        }

        res.status(200).json({ activeProjectsByMonth });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getActiveProjectsByYear = async (req, res) => {
    try {
        const activeProjectsByYear = {};


        for (let year = 2020; year <= 2025; year++) {
            const startOfYear = new Date(year, 0, 1);
            const endOfYear = new Date(year, 11, 31);


            const activeProjectsCount = await Project.countDocuments({
                status: { $in: ['Testing', 'InProgress'] },
                createdAt: { $gte: startOfYear, $lte: endOfYear }
            });

            activeProjectsByYear[year] = activeProjectsCount;
        }

        res.status(200).json({ activeProjectsByYear });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.getTotalActiveProjectsCount = async (req, res) => {
    try {

        const activeProjects = await Project.find({
            status: { $in: ['Testing', 'InProgress'] }
        });

        res.status(200).json({ count: activeProjects.length, data: activeProjects });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getTotalProjectCountsByMonth = async (req, res) => {
    try {
        const currentDate = new Date();
        const currentYear = currentDate.getFullYear();
        const TotalProjectsByMonth = {};


        for (let month = 0; month < 12; month++) {
            const startOfMonth = new Date(currentYear, month, 1);
            const endOfMonth = new Date(currentYear, month + 1, 0);


            const TotalProjectsCount = await Project.countDocuments({
                createdAt: { $gte: startOfMonth, $lte: endOfMonth }
            });

            TotalProjectsByMonth[new Date(currentYear, month).toLocaleString('default', { month: 'short' })] = TotalProjectsCount;
        }

        res.status(200).json({ TotalProjectsByMonth });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

//Total projects in a week
exports.getTotalProjectCountsByWeekInMonth = async (req, res) => {
    try {
        const currentYear = new Date().getFullYear();
        const currentMonth = new Date().getMonth() + 1;
        const daysInMonth = new Date(currentYear, currentMonth, 0).getDate();
        const firstDayOfMonth = new Date(currentYear, currentMonth - 1, 1);
        const lastDayOfMonth = new Date(currentYear, currentMonth - 1, daysInMonth);

        const isoWeekFirstDayOfMonth = getISOWeek(firstDayOfMonth);
        const isoWeekLastDayOfMonth = getISOWeek(lastDayOfMonth);

        const totalWeeksInMonth = isoWeekLastDayOfMonth - isoWeekFirstDayOfMonth + 1;

        const projectCountsByMonthWeek = {
            totalProjectsByWeek: {}
        };

        for (let i = 1; i <= totalWeeksInMonth; i++) {
            projectCountsByMonthWeek.totalProjectsByWeek[`Week${i}`] = 0;
        }

        const projectsInMonth = await Project.find({
            createdAt: { $gte: firstDayOfMonth, $lte: lastDayOfMonth }
        });

        projectsInMonth.forEach(project => {
            const isoWeekProject = getISOWeek(project.createdAt);
            const weekNumber = isoWeekProject - isoWeekFirstDayOfMonth + 1;
            if (weekNumber >= 1 && weekNumber <= totalWeeksInMonth) {
                projectCountsByMonthWeek.totalProjectsByWeek[`Week${weekNumber}`]++;
            }
        });

        res.status(200).json(projectCountsByMonthWeek);
    } catch (error) {
        console.error('Error fetching total project counts by month and week:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }

};

// Function to get ISO week number
function getISOWeek(date) {
    const tempDate = new Date(date);
    tempDate.setHours(0, 0, 0, 0);
    tempDate.setDate(tempDate.getDate() + 3 - (tempDate.getDay() + 6) % 7);
    const week1 = new Date(tempDate.getFullYear(), 0, 4);
    return 1 + Math.round(((tempDate - week1) / 86400000 - 3 + (week1.getDay() + 6) % 7) / 7);
}

exports.getTotalProjectsByYear = async (req, res) => {
    try {
        const TotalProjectsByYear = {};


        for (let year = 2020; year <= 2025; year++) {
            const startOfYear = new Date(year, 0, 1);
            const endOfYear = new Date(year, 11, 31);


            const TotalProjectsCount = await Project.countDocuments({
                createdAt: { $gte: startOfYear, $lte: endOfYear }
            });

            TotalProjectsByYear[year] = TotalProjectsCount;
        }

        res.status(200).json({ TotalProjectsByYear });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getTotalProjectCountsInCurrentSixMonths = async (req, res) => {
    try {
        const currentDate = new Date();
        const currentMonth = currentDate.getMonth();
        const currentYear = currentDate.getFullYear();

        const startOfCurrentSixMonths = new Date(currentYear, currentMonth - 5, 1);

        if (currentMonth < 5) {
            startOfCurrentSixMonths.setFullYear(currentYear - 1);
        }

        const endOfCurrentSixMonths = new Date(currentYear, currentMonth + 1, 0);

        if (currentMonth > 5) {
            endOfCurrentSixMonths.setFullYear(currentYear + 1);
        }

        const startOfPreviousSixMonths = new Date(startOfCurrentSixMonths);
        startOfPreviousSixMonths.setMonth(startOfPreviousSixMonths.getMonth() - 6);

        const endOfPreviousSixMonths = new Date(endOfCurrentSixMonths);
        endOfPreviousSixMonths.setMonth(endOfPreviousSixMonths.getMonth() - 6);

        const totalProjectCountCurrent = await Project.countDocuments({
            createdAt: { $gte: startOfCurrentSixMonths, $lte: endOfCurrentSixMonths }
        });

        const totalProjectCountPrevious = await Project.countDocuments({
            createdAt: { $gte: startOfPreviousSixMonths, $lte: endOfPreviousSixMonths }
        });

        const changeInProjectCount = totalProjectCountCurrent - totalProjectCountPrevious;

        const percentageChange = (changeInProjectCount / totalProjectCountPrevious) * 100;

        res.status(200).json({
            totalProjectCountCurrent,
            totalProjectCountPrevious,
            changeInProjectCount,
            percentageChange
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.calculateTotalDepositedAmount = async (req, res) => {
    try {
        const currentDate = new Date();
        const currentEnd = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
        const currentStart = new Date(currentDate.getFullYear(), currentDate.getMonth() - 3);
        const previousEnd = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 0);
        const previousStart = new Date(currentDate.getFullYear(), currentDate.getMonth() - 7);

        const currentResult = await Project.aggregate([
            {
                $match: {
                    createdAt: { $gte: currentStart, $lte: currentEnd }
                }
            },
            {
                $group: {
                    _id: null,
                    totalDepositedAmount: { $sum: "$depositedAmount" }
                }
            }
        ]);

        const previousResult = await Project.aggregate([
            {
                $match: {
                    createdAt: { $gte: previousStart, $lte: previousEnd }
                }
            },
            {
                $group: {
                    _id: null,
                    totalDepositedAmount: { $sum: "$depositedAmount" }
                }
            }
        ]);

        const currentTotal = currentResult.length > 0 ? currentResult[0].totalDepositedAmount : 0;
        const previousTotal = previousResult.length > 0 ? previousResult[0].totalDepositedAmount : 0;

        const percentageChange = ((currentTotal - previousTotal) / previousTotal) * 100;

        res.status(200).json({ currentTotal, previousTotal, percentageChange });
    } catch (error) {
        console.error("Error calculating total deposited amount and change:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

exports.getWeeklyDepositedAmounts = async (req, res) => {

    try {
        const currentDate = new Date();
        const currentWeekStartDate = new Date(currentDate);
        currentWeekStartDate.setDate(currentWeekStartDate.getDate() - currentDate.getDay());

        const weeklyDepositedAmounts = {};

        for (let i = 0; i < 7; i++) {
            const startDate = new Date(currentWeekStartDate);
            startDate.setDate(startDate.getDate() + i);
            startDate.setHours(0, 0, 0, 0);

            const endDate = new Date(startDate);
            endDate.setDate(endDate.getDate() + 1);
            endDate.setHours(0, 0, 0, 0);

            const totalDepositedAmount = await Project.aggregate([
                {
                    $match: {
                        createdAt: { $gte: startDate, $lt: endDate }
                    }
                },
                {
                    $group: {
                        _id: null,
                        totalAmount: { $sum: '$depositedAmount' }
                    }
                }
            ]);

            weeklyDepositedAmounts[i + 1] = totalDepositedAmount.length ? totalDepositedAmount[0].totalAmount : 0;
        }

        res.status(200).json(weeklyDepositedAmounts)
    } catch (error) {
        console.error('Error fetching weekly deposited amounts:', error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

exports.getWeeklyDepositedAmountsPercentageChange = async (req, res) => {
    try {
        const currentDate = new Date();
        const currentWeekStartDate = new Date(currentDate);
        currentWeekStartDate.setDate(currentWeekStartDate.getDate() - currentDate.getDay());

        const weeklyDepositedAmounts = {};
        let thisWeekTotal = 0;
        let lastWeekTotal = 0;

        for (let i = 0; i < 7; i++) {
            const startDate = new Date(currentWeekStartDate);
            startDate.setDate(startDate.getDate() + i);
            startDate.setHours(0, 0, 0, 0);

            const endDate = new Date(startDate);
            endDate.setDate(endDate.getDate() + 1);
            endDate.setHours(0, 0, 0, 0);

            const totalDepositedAmount = await Project.aggregate([
                {
                    $match: {
                        createdAt: { $gte: startDate, $lt: endDate }
                    }
                },
                {
                    $group: {
                        _id: null,
                        totalAmount: { $sum: '$depositedAmount' }
                    }
                }
            ]);

            const totalAmount = totalDepositedAmount.length ? totalDepositedAmount[0].totalAmount : 0;
            weeklyDepositedAmounts[i + 1] = totalAmount;


            if (i < currentDate.getDay()) {
                thisWeekTotal += totalAmount;
            } else {
                lastWeekTotal += totalAmount;
            }
        }

        const percentageChange = lastWeekTotal !== 0 ? ((thisWeekTotal - lastWeekTotal) / lastWeekTotal) * 100 : 0;

        res.status(200).json(percentageChange);
    } catch (error) {
        console.error('Error fetching weekly deposited amounts:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }

}


exports.calculateTotalDeposit = async (req, res) => {
    try {

        const projects = await Project.find();


        let totalAmount = 0;
        projects.forEach(deposit => {
            totalAmount += deposit.depositedAmount;
        });

        res.status(200).json(totalAmount)
    } catch (error) {

        console.error("Error calculating total deposited amount:", error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};




exports.filterSalesByDate = async (req, res) => {
    try {

        const { startDate, endDate } = req.query;

        const startDateObj = new Date(startDate);
        const endDateObj = new Date(endDate);


        const salesTransactions = await Project.find({
            createdAt: { $gte: startDateObj, $lte: endDateObj }
        });

        res.status(200).json({ salesTransactions });
    } catch (error) {
        console.error('Error filtering sales by date:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};





exports.calculateTotalSalesAmount = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        console.log(startDate, endDate)
        const startDateObj = new Date(startDate);
        const endDateObj = new Date(endDate);

        const salesTransactions = await Project.find({
            createdAt: { $gte: startDateObj, $lte: endDateObj }
        });

        const totalSalesAmount = await Project.aggregate([
            {
                $match: {
                    createdAt: { $gte: startDateObj, $lte: endDateObj }
                }
            },
            {
                $group: {
                    _id: null,
                    totalAmount: { $sum: '$depositedAmount' }
                }
            }
        ]);

        res.status(200).json({ totalSalesAmount });
    } catch (error) {
        console.error('Error calculating total sales amount:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};