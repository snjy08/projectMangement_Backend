const express = require('express');

const socialMediaController = require('../controller/socialMediaController');

const router = express.Router();

router.post('/add' , socialMediaController.createSocialMediaPost)
router.get('/', socialMediaController.getOverallSocialNetworkingData)
router.get('/LastTwoYearsData',socialMediaController.getLastTwoYearsData)
module.exports = router;
