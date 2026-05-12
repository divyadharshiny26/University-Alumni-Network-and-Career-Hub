const express = require('express');
const {
  getEvents,
  createEvent,
  rsvpEvent
} = require('../controllers/eventController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', getEvents);
router.post('/', protect, createEvent);
router.put('/:id/rsvp', protect, rsvpEvent);

module.exports = router;
