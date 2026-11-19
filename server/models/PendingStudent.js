const mongoose = require('mongoose');

const pendingStudentSchema = new mongoose.Schema({
  id: {
    type: String,
    default: () => require('uuid').v4(),
    unique: true
  },
  roll_no: { type: String, required: true },
  first_name: { type: String, required: true },
  last_name: { type: String, required: true },
  email: { type: String, required: true, lowercase: true },
  password: { type: String, required: true },
  grad_year_expected: { type: Number, required: true },
  department: { type: String, required: true },
  otp_code: { type: String, required: true },
  otp_expires: { type: Date, required: true }
}, {
  timestamps: true
});

// Helpful uniqueness to avoid duplicates across pending
pendingStudentSchema.index({ email: 1 }, { unique: true });
pendingStudentSchema.index({ roll_no: 1 }, { unique: true });
pendingStudentSchema.index({ otp_expires: 1 }, { expireAfterSeconds: 0, partialFilterExpression: { otp_expires: { $exists: true } } });

module.exports = mongoose.model('PendingStudent', pendingStudentSchema);
