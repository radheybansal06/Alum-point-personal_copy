const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  id: {
    type: String,
    default: () => require('uuid').v4(),
    unique: true
  },
  roll_no: {
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
  grad_year_expected: {
    type: Number,
    required: true
  },
  department: {
    type: String,
    required: true
  },
  skills: [{
    type: String
  }],
  interests: [{
    type: String
  }],
  resume_url: {
    type: String,
    default: ''
  },
  profile_picture_url: {
    type: String,
    default: ''
  },
  verified_otp: {
    type: Boolean,
    default: false
  },
  otp_code: {
    type: String,
    default: null
  },
  otp_expires: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Student', studentSchema);