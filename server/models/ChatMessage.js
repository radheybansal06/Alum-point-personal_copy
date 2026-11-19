const mongoose = require('mongoose');

const chatMessageSchema = new mongoose.Schema({
  id: {
    type: String,
    default: () => require('uuid').v4(),
    unique: true
  },
  channel: {
    type: String,
    required: true
  },
  sender_id: {
    type: String,
    required: true
  },
  sender_type: {
    type: String,
    enum: ['student', 'alumni', 'admin'],
    required: true
  },
  sender_name: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  is_edited: {
    type: Boolean,
    default: false
  },
  edited_at: {
    type: Date,
    default: null
  },
  is_deleted: {
    type: Boolean,
    default: false
  },
  deleted_at: {
    type: Date,
    default: null
  },
  deleted_by: {
    type: String,
    default: null // Admin ID if deleted by admin
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('ChatMessage', chatMessageSchema);