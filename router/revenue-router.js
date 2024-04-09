const express = require('express');

const revenueController = require('../controller/revenueController');

const router = express.Router();

router.post('/add', revenueController.addRevenue)
router.get('/', revenueController.getOverallRevenue)
router.get('/daily', revenueController.getDailyRevenue)
router.get('/week', revenueController.getWeeklyRevenue)
router.get('/month', revenueController.getMonthlyRevenue)
router.get('/year', revenueController.getYearlyRevenue)


module.exports = router;