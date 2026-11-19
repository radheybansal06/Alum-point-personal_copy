const mongoose = require('mongoose');

const mentorshipSchema = new mongoose.Schema({
  id: {
    type: String,
    default: () => require('uuid').v4(),
    unique: true
  },
  student_id: {
    type: String,
    required: true
  },
  alumni_id: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected', 'completed'],
    default: 'pending'
  },
  request_message: {
    type: String,
    required: true
  },
  response_message: {
    type: String,
    default: ''
  },
  requested_at: {
    type: Date,
    default: Date.now
  },
  responded_at: {
    type: Date,
    default: null
  },
  chat_messages: [{
    sender_id: {
      type: String,
      required: true
    },
    sender_type: {
      type: String,
      enum: ['student', 'alumni'],
      required: true
    },
    message: {
      type: String,
      required: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

module.exports = mongoose.model('Mentorship', mentorshipSchema);