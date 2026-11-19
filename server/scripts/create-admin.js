const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
require('dotenv').config();

// Import the Admin model
const Admin = require('../models/Admin');

const createAdmin = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/alumpoint');
    console.log('Connected to MongoDB');

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ employee_id: 'ADMIN001' });
    if (existingAdmin) {
      console.log('Admin account already exists!');
      process.exit(0);
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('admin123', salt);

    // Create admin account
    const admin = new Admin({
      employee_id: 'ADMIN001',
      first_name: 'Admin',
      last_name: 'User',
      email: 'admin@university.edu',
      password: hashedPassword,
      role: 'admin'
    });

    await admin.save();
    console.log('Admin account created successfully!');
    console.log('Employee ID: ADMIN001');
    console.log('Password: admin123');
    console.log('Email: admin@university.edu');
    console.log('\nPlease change the password after first login!');

  } catch (error) {
    console.error('Error creating admin account:', error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
};

createAdmin();