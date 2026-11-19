const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const alumniSchema = new mongoose.Schema({
  id: {
    type: String,
    default: uuidv4,
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
  grad_year: {
    type: Number,
    required: true
  },
  department: {
    type: String,
    required: true
  },
  company: {
    type: String,
    default: ''
  },
  role: {
    type: String,
    default: ''
  },
  skills: [{
    type: String
  }],
  bio: {
    type: String,
    default: ''
  },
  resume_url: {
    type: String,
    default: ''
  },
  linkedin: {
    type: String,
    default: ''
  },
  github: {
    type: String,
    default: ''
  },
  karma_points: {
    type: Number,
    default: 0
  },
  verified: {
    type: Boolean,
    default: false
  },
  invited_at: {
    type: Date,
    default: Date.now
  },
  last_login: {
    type: Date,
    default: null
  },

  // --- Resume Extracted Fields ---
  professional_summary: { type: String, default: '' },

  contact_details: {
    phone: { type: String, default: null },
    location: { type: String, default: null }
  },

  work_history: [{
    title: { type: String },
    company: { type: String },
    start_date: { type: String },
    end_date: { type: String },
    description: { type: String }
  }],

  education_history: [{
    institution: { type: String },
    degree: { type: String },
    gpa: { type: String, default: null },
    end_year: { type: Number }
  }],

  detailed_skills: {
    languages: [{ type: String }],
    web_development: [{ type: String }],
    frameworks_and_libraries: [{ type: String }],
    tools_and_platforms: [{ type: String }],
    concepts: [{ type: String }]
  },

  projects: [{
    name: { type: String },
    description: { type: String }
  }],

  achievements: [{ type: String }]
}, {
  timestamps: true
});

module.exports = mongoose.model('Alumni', alumniSchema);