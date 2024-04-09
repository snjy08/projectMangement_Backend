const Expense = require('../model/expenseSchema');

exports.addExpense = async (req, res) => {
    try {
        const { description, amount, category } = req.body;
        const newExpense = new Expense({
            description,
            amount,
            category
        });
        await newExpense.save();
        res.status(201).json(newExpense);
    } catch (error) {
        console.error('Error adding expense:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// Get overall expenses
exports.getOverallExpenses = async (req, res) => {
    try {
        const expenses = await Expense.find();

        const totalExpenses = await Expense.aggregate([
            {
                $group: {
                    _id: null,
                    totalAmount: { $sum: '$amount' }
                }
            }
        ]);


        const overallTotal = totalExpenses.length > 0 ? totalExpenses[0].totalAmount : 0;

        res.status(200).json({ expenses, overallTotal });
    } catch (error) {
        console.error('Error fetching overall expenses:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// Get daily expenses
exports.getDailyExpenses = async (req, res) => {
    try {
        const today = new Date();
        const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0);
        const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);

        const expenses = await Expense.find({ createdAt: { $gte: startOfDay, $lte: endOfDay } });
        res.status(200).json(expenses);
    } catch (error) {
        console.error('Error fetching daily expenses:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

exports.getWeeklyExpenses = async (req, res) => {
    try {
        const today = new Date();

        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay());

        const endOfWeek = new Date(today);
        endOfWeek.setDate(startOfWeek.getDate() + 6);
        console.log(startOfWeek, endOfWeek)
        const startOfLastWeek = new Date(startOfWeek);
        startOfLastWeek.setDate(startOfWeek.getDate() - 7);

        const endOfLastWeek = new Date(endOfWeek);
        endOfLastWeek.setDate(endOfWeek.getDate() - 7);

        const currentWeekExpenses = await Expense.aggregate([
            {
                $match: {
                    createdAt: { $gte: startOfWeek, $lte: endOfWeek }
                }
            },
            {
                $group: {
                    _id: { $dayOfMonth: '$createdAt' },
                    totalAmount: { $sum: '$amount' }
                }
            },
            {
                $sort: { '_id': 1 }
            }
        ]);

        const lastWeekExpenses = await Expense.aggregate([
            {
                $match: {
                    createdAt: { $gte: startOfLastWeek, $lte: endOfLastWeek }
                }
            },
            {
                $group: {
                    _id: null,
                    totalAmount: { $sum: '$amount' }
                }
            }
        ]);

        let percentChange = 0;
        if (lastWeekExpenses.length > 0 && currentWeekExpenses.length > 0) {
            const currentWeekTotal = currentWeekExpenses.reduce((acc, day) => acc + day.totalAmount, 0);
            const lastWeekTotal = lastWeekExpenses[0].totalAmount;
            percentChange = ((currentWeekTotal - lastWeekTotal) / lastWeekTotal) * 100;
        }

        const weeklyExpenses = [];
        for (let i = 1; i <= 7; i++) {
            const dayExpense = currentWeekExpenses.find(day => Number(day._id) === i);
            weeklyExpenses.push({
                day: String(i),
                amount: dayExpense ? dayExpense.totalAmount : 0
            });
        }

        res.status(200).json({
            weeklyExpenses,
            currentWeekTotal: currentWeekExpenses.length > 0 ? currentWeekExpenses.reduce((acc, day) => acc + day.totalAmount, 0) : 0,
            lastWeekTotal: lastWeekExpenses.length > 0 ? lastWeekExpenses[0].totalAmount : 0,
            percentChange: percentChange.toFixed(2) // Round to 2 decimal places
        });
    } catch (error) {
        console.error('Error fetching weekly expenses:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};


// Get monthly expenses
exports.getMonthlyExpenses = async (req, res) => {
    try {
        const today = new Date();
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59);

        const expenses = await Expense.find({ createdAt: { $gte: startOfMonth, $lte: endOfMonth } });
        res.status(200).json(expenses);
    } catch (error) {
        console.error('Error fetching monthly expenses:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// Get yearly expenses
exports.getYearlyExpenses = async (req, res) => {
    try {
        const today = new Date();
        const startOfYear = new Date(today.getFullYear(), 0, 1);
        const endOfYear = new Date(today.getFullYear(), 11, 31, 23, 59, 59);

        const expenses = await Expense.find({ createdAt: { $gte: startOfYear, $lte: endOfYear } });
        res.status(200).json(expenses);
    } catch (error) {
        console.error('Error fetching yearly expenses:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
