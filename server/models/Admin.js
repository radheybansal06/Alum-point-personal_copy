const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema({
  id: {
    type: String,
    default: () => require('uuid').v4(),
    unique: true
  },
  employee_id: {
    type: String,
    required: true,
    unique: true
  },
  first_name: {
    type: String,
    required: true
  },
  last_name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    default: 'admin'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Admin', adminSchema);