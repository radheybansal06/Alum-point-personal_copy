const jwt = require('jsonwebtoken');
const Alumni = require('../models/Alumni');
const Student = require('../models/Student');
const Admin = require('../models/Admin');

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'No token, authorization denied' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
    
    let user = null;
    let userType = null;

    // Check which type of user this is
    if (decoded.type === 'alumni') {
      user = await Alumni.findById(decoded.id);
      userType = 'alumni';
    } else if (decoded.type === 'student') {
      user = await Student.findById(decoded.id);
      userType = 'student';
    } else if (decoded.type === 'admin') {
      user = await Admin.findById(decoded.id);
      userType = 'admin';
    }

    if (!user) {
      return res.status(401).json({ message: 'Token is not valid' });
    }

    req.user = user;
    req.userType = userType;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};

const requireAdmin = (req, res, next) => {
  if (req.userType !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }
  next();
};

const requireAlumni = (req, res, next) => {
  if (req.userType !== 'alumni') {
    return res.status(403).json({ message: 'Alumni access required' });
  }
  next();
};

const requireStudent = (req, res, next) => {
  if (req.userType !== 'student') {
    return res.status(403).json({ message: 'Student access required' });
  }
  next();
};

module.exports = { auth, requireAdmin, requireAlumni, requireStudent };