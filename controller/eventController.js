const Event = require('../model/eventSchema');

exports.createEvent = async (req, res) => {
    try {
        const { title,  companyName, date, location } = req.body;
        const event = new Event({
            title,
            companyName,
            date,
            location
        });
        const savedEvent = await event.save();
        res.status(201).json(savedEvent);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};


exports.getAllEvents = async (req, res) => {
    try {
        const events = await Event.find();
        res.json(events);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


exports.updateEvent = async (req, res) => {
    try {
        const { title, companyName, date, location } = req.body;

        console.log(title,  companyName, date, location)
        const updatedEvent = await Event.findByIdAndUpdate(req.params.id, {
            title,
            companyName ,
            date,
            location
        }, { new: true });
        if (!updatedEvent) {
            return res.status(404).json({ message: 'Event not found' });
        }
        res.json(updatedEvent);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

exports.deleteEvent = async (req, res) => {
    try {
        const deletedEvent = await Event.findByIdAndDelete(req.params.id);
        if (!deletedEvent) {
            return res.status(404).json({ message: 'Event not found' });
        }
        res.json({ message: 'Event deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
