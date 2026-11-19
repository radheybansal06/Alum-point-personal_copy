const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { auth } = require('../middleware/auth');
const Alumni = require('../models/Alumni');
const Student = require('../models/Student');
const PendingStudent = require('../models/PendingStudent');
const Admin = require('../models/Admin');
const { sendOTP } = require('../utils/email');

const router = express.Router();

// Generate JWT token
const generateToken = (id, type) => {
  return jwt.sign({ id, type }, process.env.JWT_SECRET || 'fallback_secret', {
    expiresIn: '7d'
  });
};

// Get current user
router.get('/me', auth, async (req, res) => {
  try {
    const user = req.user;
    const userType = req.userType;

    res.json({
      user: {
        id: user.id,
        name: `${user.first_name} ${user.last_name}`,
        email: user.email,
        type: userType,
        verified: user.verified || user.verified_otp || false
      }
    });
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({ message: 'Error fetching user data' });
  }
});

// Admin login
router.post('/admin/login', async (req, res) => {
  try {
    const { employee_id, password } = req.body;

    if (!employee_id || !password) {
      return res.status(400).json({ message: 'Employee ID and password are required' });
    }

    const admin = await Admin.findOne({ employee_id });
    if (!admin) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = generateToken(admin._id, 'admin');
    res.json({
      token,
      user: {
        id: admin.id,
        employee_id: admin.employee_id,
        name: `${admin.first_name} ${admin.last_name}`,
        email: admin.email,
        type: 'admin'
      }
    });
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Alumni login
router.post('/alumni/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const alumni = await Alumni.findOne({ email: email.toLowerCase() });
    if (!alumni) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, alumni.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Update last login
    alumni.last_login = new Date();
    await alumni.save();

    const token = generateToken(alumni._id, 'alumni');
    res.json({
      token,
      user: {
        id: alumni.id,
        name: `${alumni.first_name} ${alumni.last_name}`,
        email: alumni.email,
        type: 'alumni',
        verified: alumni.verified
      }
    });
  } catch (error) {
    console.error('Alumni login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Student signup (uses PendingStudent; only writes to Students after OTP verification)
router.post('/student/signup', async (req, res) => {
  try {
    const { first_name, last_name, roll_no, email, password, grad_year_expected, department } = req.body;

    // Validate required fields
    if (!first_name || !last_name || !roll_no || !email || !password || !grad_year_expected || !department) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Check if student or pending already exists
    const [existingStudent, existingPending] = await Promise.all([
      Student.findOne({ $or: [{ email: email.toLowerCase() }, { roll_no }] }),
      PendingStudent.findOne({ $or: [{ email: email.toLowerCase() }, { roll_no }] })
    ]);
    
    if (existingStudent) {
      return res.status(400).json({ message: 'Student already exists with this email or roll number' });
    }
    if (existingPending) {
      return res.status(400).json({ message: 'Signup already initiated. Please verify OTP sent to your email.' });
    }

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create pending student record only
    const pending = new PendingStudent({
      first_name,
      last_name,
      roll_no,
      email: email.toLowerCase(),
      password: hashedPassword,
      grad_year_expected,
      department,
      otp_code: otp,
      otp_expires: otpExpires
    });

    await pending.save();

    // Send OTP email
    const emailSent = await sendOTP(email, otp);
    if (!emailSent) {
      // Clean up pending if email failed
      await PendingStudent.deleteOne({ _id: pending._id });
      return res.status(500).json({ message: 'Failed to send OTP email' });
    }

    res.json({ message: 'Signup initiated. Please check your email for OTP verification.' });
  } catch (error) {
    console.error('Student signup error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Student OTP verification: promote from PendingStudent -> Student
router.post('/student/verify-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ message: 'Email and OTP are required' });
    }

    const pending = await PendingStudent.findOne({ email: email.toLowerCase() });
    if (!pending) {
      // If not in pending, check if already verified student exists
      const existing = await Student.findOne({ email: email.toLowerCase() });
      if (existing?.verified_otp) {
        return res.status(400).json({ message: 'Email already verified' });
      }
      return res.status(400).json({ message: 'No pending signup found for this email' });
    }

    if (pending.otp_code !== otp) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    if (new Date() > pending.otp_expires) {
      await PendingStudent.deleteOne({ _id: pending._id });
      return res.status(400).json({ message: 'OTP expired. Please sign up again.' });
    }

    // Promote to Students collection
    const student = new Student({
      first_name: pending.first_name,
      last_name: pending.last_name,
      roll_no: pending.roll_no,
      email: pending.email,
      password: pending.password,
      grad_year_expected: pending.grad_year_expected,
      department: pending.department,
      verified_otp: true
    });
    await student.save();
    await PendingStudent.deleteOne({ _id: pending._id });

    const token = generateToken(student._id, 'student');
    res.json({
      token,
      user: {
        id: student.id,
        name: `${student.first_name} ${student.last_name}`,
        email: student.email,
        type: 'student',
        verified: student.verified_otp
      }
    });
  } catch (error) {
    console.error('Student OTP verification error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Student login
router.post('/student/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const student = await Student.findOne({ email: email.toLowerCase() });
    if (!student) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    if (!student.verified_otp) {
      return res.status(400).json({ message: 'Please verify your email first' });
    }

    const isMatch = await bcrypt.compare(password, student.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = generateToken(student._id, 'student');
    res.json({
      token,
      user: {
        id: student.id,
        name: `${student.first_name} ${student.last_name}`,
        email: student.email,
        type: 'student',
        verified: student.verified_otp
      }
    });
  } catch (error) {
    console.error('Student login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;