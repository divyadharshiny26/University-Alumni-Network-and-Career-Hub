const Event = require('../models/Event');

// @desc Get all events
// @route GET /api/events
const getEvents = async (req, res, next) => {
  try {
    const events = await Event.find({ isPublished: true })
      .populate('organizer', 'name avatar')
      .populate('attendees.user', 'name avatar')
      .sort('date')
      .limit(10);
    res.json({ success: true, count: events.length, events });
  } catch (error) {
    next(error);
  }
};

// @desc Create event
// @route POST /api/events
const createEvent = async (req, res, next) => {
  try {
    req.body.organizer = req.user.id;
    // Auto-publish events for better user experience
    req.body.isPublished = true;
    const event = await Event.create(req.body);
    res.status(201).json({ success: true, event });
  } catch (error) {
    next(error);
  }
};

// @desc RSVP to event
// @route PUT /api/events/:id/rsvp
const rsvpEvent = async (req, res, next) => {
  try {
    const { rsvpStatus } = req.body;
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }
    
    const existingRsvp = event.attendees.find(att => att.user.toString() === req.user.id);
    if (existingRsvp) {
      existingRsvp.rsvpStatus = rsvpStatus;
    } else {
      event.attendees.push({ user: req.user.id, rsvpStatus });
    }
    
    await event.save();
    res.json({ success: true, message: 'RSVP updated' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getEvents,
  createEvent,
  rsvpEvent
};
