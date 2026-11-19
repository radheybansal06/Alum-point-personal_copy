const mongoose = require('mongoose');

const opportunitySchema = new mongoose.Schema({
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
  type: {
    type: String,
    enum: ['internship', 'freelance', 'job', 'project'],
    required: true
  },
  company: {
    type: String,
    required: true
  },
  location: {
    type: String,
    default: ''
  },
  skills_required: [{
    type: String
  }],
  experience_level: {
    type: String,
    enum: ['entry', 'mid', 'senior'],
    default: 'entry'
  },
  salary_range: {
    type: String,
    default: ''
  },
  application_deadline: {
    type: Date,
    default: null
  },
  posted_by: {
    type: String,
    required: true // Alumni ID
  },
  applications: [{
    student_id: {
      type: String,
      required: true
    },
    applied_at: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected'],
      default: 'pending'
    },
    cover_letter: {
      type: String,
      default: ''
    }
  }],
  is_active: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Opportunity', opportunitySchema);