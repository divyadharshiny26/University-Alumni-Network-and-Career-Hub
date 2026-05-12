const mongoose = require('mongoose');

const mentorshipSchema = new mongoose.Schema({
  mentor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  mentee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'active', 'completed', 'cancelled'],
    default: 'pending'
  },
  sessions: [{
    title: String,
    date: Date,
    duration: Number, // mins
    notes: String,
    recordingUrl: String,
    roomId: String // socket room
  }],
  goals: [String],
  skillFocus: [String],
  matchedBy: {
    type: String,
    enum: ['ai', 'manual'],
    default: 'ai'
  },
  rating: Number, // 1-5 by mentee
  feedback: String
}, {
  timestamps: true
});

module.exports = mongoose.model('Mentorship', mentorshipSchema);
