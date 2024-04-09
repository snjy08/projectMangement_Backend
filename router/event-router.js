const express = require('express');

const eventController = require('../controller/eventController');

const router = express.Router();

router.post('/add', eventController.createEvent)
router.get('/', eventController.getAllEvents)
router.delete('/delete/:id', eventController.deleteEvent)
router.patch('/edit/:id', eventController.updateEvent)


module.exports = router;