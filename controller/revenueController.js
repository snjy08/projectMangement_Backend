const Revenue = require('../model/revenueSchema');

// Add revenue
exports.addRevenue = async (req, res) => {
    try {
        const { type, amount } = req.body;
        const newRevenue = new Revenue({
            type,
            amount
        });
        await newRevenue.save();
        res.status(201).json(newRevenue);
    } catch (error) {
        console.error('Error adding revenue:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// Get overall revenue
exports.getOverallRevenue = async (req, res) => {
    try {
        const revenues = await Revenue.find();

        const totalRevenue = await Revenue.aggregate([
            {
                $group: {
                    _id: null,
                    totalAmount: { $sum: '$amount' }
                }
            }
        ]);

        // Extract the total sum from the aggregation result
        const overallTotal = totalRevenue.length > 0 ? totalRevenue[0].totalAmount : 0;

        res.status(200).json({ revenues, overallTotal });
    } catch (error) {
        console.error('Error fetching overall revenue:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// Get daily revenue
exports.getDailyRevenue = async (req, res) => {
    try {
        const today = new Date();
        const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0);
        const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);

        const revenues = await Revenue.find({ date: { $gte: startOfDay, $lte: endOfDay } });
        res.status(200).json(revenues);
    } catch (error) {
        console.error('Error fetching daily revenue:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// Get weekly revenue
exports.getWeeklyRevenue = async (req, res) => {
    try {
        const today = new Date();

        
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay());

        const endOfWeek = new Date(today);
        endOfWeek.setDate(startOfWeek.getDate() + 6);

        const startOfLastWeek = new Date(startOfWeek);
        startOfLastWeek.setDate(startOfWeek.getDate() - 7);

        const endOfLastWeek = new Date(endOfWeek);
        endOfLastWeek.setDate(endOfWeek.getDate() - 7);

        const currentWeekRevenue = await Revenue.aggregate([
            {
                $match: {
                    date: { $gte: startOfWeek, $lte: endOfWeek }
                }
            },
            {
                $group: {
                    _id: { $dayOfMonth: '$date' },
                    totalAmount: { $sum: '$amount' }
                }
            },
            {
                $sort: { '_id': 1 }
            }
        ]);

        const lastWeekRevenue = await Revenue.aggregate([
            {
                $match: {
                    date: { $gte: startOfLastWeek, $lte: endOfLastWeek }
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
        if (lastWeekRevenue.length > 0 && currentWeekRevenue.length > 0) {
            const currentWeekTotal = currentWeekRevenue.reduce((acc, day) => acc + day.totalAmount, 0);
            const lastWeekTotal = lastWeekRevenue[0].totalAmount;
            percentChange = ((currentWeekTotal - lastWeekTotal) / lastWeekTotal) * 100;
        }

        const weeklyRevenue = Array.from({ length: 7 }, (_, index) => {
            const dayRevenue = currentWeekRevenue.find(day => Number(day._id) === (index + 1));
            return {
                day: String(index + 1),
                amount: dayRevenue ? dayRevenue.totalAmount : 0
            };
        });

        res.status(200).json({
            weeklyRevenue,
            currentWeekTotal: currentWeekRevenue.length > 0 ? currentWeekRevenue.reduce((acc, day) => acc + day.totalAmount, 0) : 0,
            lastWeekTotal: lastWeekRevenue.length > 0 ? lastWeekRevenue[0].totalAmount : 0,
            percentChange: percentChange.toFixed(2) // Round to 2 decimal places
        });
    } catch (error) {
        console.error('Error fetching weekly revenue:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};


// Get monthly revenue
exports.getMonthlyRevenue = async (req, res) => {
    try {
        const today = new Date();
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59);

        const revenue = await Revenue.find({ date: { $gte: startOfMonth, $lte: endOfMonth } });
        res.status(200).json(revenue);
    } catch (error) {
        console.error('Error fetching monthly revenue:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// Get yearly revenue
exports.getYearlyRevenue = async (req, res) => {
    try {
        const today = new Date();
        const startOfYear = new Date(today.getFullYear(), 0, 1);
        const endOfYear = new Date(today.getFullYear(), 11, 31, 23, 59, 59);

        const revenue = await Revenue.find({ date: { $gte: startOfYear, $lte: endOfYear } });
        res.status(200).json(revenue);

    } catch (error) {
        console.error('Error fetching yearly expenses:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
