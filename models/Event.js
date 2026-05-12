const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: String,
  date: {
    type: Date,
    required: true
  },
  location: String, // virtual/physical
  type: {
    type: String,
    enum: ['webinar', 'career_fair', 'networking', 'workshop', 'alumni_meet', 'hackathon'],
    required: true
  },
  organizer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  attendees: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    rsvpStatus: {
      type: String,
      enum: ['yes', 'no', 'maybe'],
      default: 'yes'
    },
    attended: {
      type: Boolean,
      default: false
    },
    certGenerated: {
      type: Boolean,
      default: false
    }
  }],
  maxAttendees: Number,
  certTemplate: String, // HTML template for NFT cert
  isVirtual: {
    type: Boolean,
    default: false
  },
  meetingLink: String,
  registrationLink: {
    type: String,
    default: ''
  },
  isPublished: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Event', eventSchema);
