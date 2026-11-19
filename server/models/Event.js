const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  id: {
    type: String,
    default: () => require('uuid').v4(),
    unique: true
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  location: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['workshop', 'seminar', 'networking', 'conference', 'social'],
    required: true
  },
  max_attendees: {
    type: Number,
    default: null
  },
  attendees: [{
    user_id: {
      type: String,
      required: true
    },
    user_type: {
      type: String,
      enum: ['student', 'alumni'],
      required: true
    },
    registered_at: {
      type: Date,
      default: Date.now
    }
  }],
  created_by: {
    type: String,
    required: true // Admin ID
  },
  is_active: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Event', eventSchema);