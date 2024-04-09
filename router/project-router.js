const express = require('express');

const projectController = require('../controller/projectController');

const multer = require('multer');

// Middleware for handling file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    }
});
const upload = multer({ storage: storage });

const router = express.Router();

router.post('/add', upload.fields([
    { name: 'uploadedImages', maxCount: 5 },
    { name: 'uploadedFiles', maxCount: 5 },
    { name: 'otherGroupMembers', maxCount: 10 }
]), projectController.addProject)
router.get('/:projectId', projectController.getAParticularProject)
router.get('/', projectController.getAllProjects)
router.put('/edit/:projectId', upload.fields([
    { name: 'uploadedImages', maxCount: 5 },
    { name: 'uploadedFiles', maxCount: 5 },
    { name: 'otherGroupMembers', maxCount: 10 }
]), projectController.editProject)
router.delete('/delete/:projectId', projectController.deletedProject)


router.get('/getActive/Week', projectController.getActiveProjectsByWeekInMonth)
router.get('/getActive/Year', projectController.getActiveProjectsByYear)
router.get('/getActive/Month', projectController.getActiveProjectsByMonth)
router.get('/getActive/Total', projectController.getTotalActiveProjectsCount)
router.get('/getTotal/Month', projectController.getTotalProjectCountsByMonth)
router.get('/getTotal/Week', projectController.getTotalProjectCountsByWeekInMonth)
router.get('/getTotal/Year', projectController.getTotalProjectsByYear)
router.get('/getTotal/sixMonth', projectController.getTotalProjectCountsInCurrentSixMonths)
router.get('/getTotal/Amount', projectController.calculateTotalDepositedAmount)


router.get('/getWeek/Deposit', projectController.getWeeklyDepositedAmounts)
router.get('/getWeek/Deposit/per', projectController.getWeeklyDepositedAmountsPercentageChange)


router.get('/getTotal/TotalAmount', projectController.calculateTotalDeposit)

router.get('/sales/filter', projectController.filterSalesByDate);

router.get('/sales/total', projectController.calculateTotalSalesAmount);

module.exports = router;

