const express = require('express');

const expenseController = require('../controller/expenseController');

const router = express.Router();

router.post('/add',expenseController.addExpense)
router.get('/',expenseController.getOverallExpenses)
router.get('/daily',expenseController.getDailyExpenses)
router.get('/week',expenseController.getWeeklyExpenses)
router.get('/month',expenseController.getMonthlyExpenses)
router.get('/year',expenseController.getYearlyExpenses)


module.exports = router;