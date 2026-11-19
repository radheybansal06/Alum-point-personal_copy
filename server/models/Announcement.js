const mongoose = require('mongoose');

const announcementSchema = new mongoose.Schema({
  id: {
    type: String,
    default: () => require('uuid').v4(),
    unique: true
  },
  title: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  target_audience: {
    type: String,
    enum: ['all', 'students', 'alumni'],
    default: 'all'
  },
  created_by: {
    type: String,
    required: true // Admin ID
  },
  is_active: {
    type: Boolean,
    default: true
  },
  expires_at: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Announcement', announcementSchema);