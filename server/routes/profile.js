const express = require('express');
const bcrypt = require('bcryptjs');
const { auth } = require('../middleware/auth');
const Alumni = require('../models/Alumni');
const Student = require('../models/Student');
const upload = require('../utils/upload');

const router = express.Router();

// Get user profile
router.get('/', auth, async (req, res) => {
  try {
    const user = req.user;
    const userType = req.userType;

    // Remove sensitive data
    const userProfile = {
      id: user.id,
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
      type: userType,
      ...(userType === 'alumni' && {
        roll_no: user.roll_no,
        grad_year: user.grad_year,
        department: user.department,
        company: user.company,
        role: user.role,
        skills: user.skills,
        bio: user.bio,
        resume_url: user.resume_url,
        linkedin: user.linkedin,
        github: user.github,
        karma_points: user.karma_points,
        verified: user.verified,
        // Resume extracted fields
        professional_summary: user.professional_summary,
        contact_details: user.contact_details,
        work_history: user.work_history,
        education_history: user.education_history,
        detailed_skills: user.detailed_skills,
        projects: user.projects,
        achievements: user.achievements
      }),
      ...(userType === 'student' && {
        roll_no: user.roll_no,
        grad_year_expected: user.grad_year_expected,
        department: user.department,
        skills: user.skills,
        interests: user.interests,
        resume_url: user.resume_url,
        profile_picture_url: user.profile_picture_url,
        verified_otp: user.verified_otp
      })
    };

    res.json({ profile: userProfile });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Error fetching profile' });
  }
});

// Update profile
router.put('/', auth, async (req, res) => {
  try {
    const updates = req.body;
    const userType = req.userType;

    // Remove fields that shouldn't be updated directly
    delete updates.password;
    delete updates.email;
    delete updates.id;
    delete updates.verified;
    delete updates.verified_otp;

    let updatedUser;

    if (userType === 'alumni') {
      updatedUser = await Alumni.findByIdAndUpdate(
        req.user._id,
        updates,
        { new: true }
      );
    } else if (userType === 'student') {
      updatedUser = await Student.findByIdAndUpdate(
        req.user._id,
        updates,
        { new: true }
      );
    }

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: 'Profile updated successfully', profile: updatedUser });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Error updating profile' });
  }
});

// Upload resume (Alumni and Students)
router.post('/upload-resume', auth, upload.single('resume'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Resume file is required' });
    }

    const userType = req.userType;
    const resumeUrl = `/uploads/${req.file.filename}`;

    let updatedUser;

    if (userType === 'alumni') {
      updatedUser = await Alumni.findByIdAndUpdate(
        req.user._id,
        { resume_url: resumeUrl },
        { new: true }
      );
    } else if (userType === 'student') {
      updatedUser = await Student.findByIdAndUpdate(
        req.user._id,
        { resume_url: resumeUrl },
        { new: true }
      );
    }

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ 
      message: 'Resume uploaded successfully', 
      resume_url: resumeUrl 
    });
  } catch (error) {
    console.error('Upload resume error:', error);
    res.status(500).json({ message: 'Error uploading resume' });
  }
});

// Upload profile picture (Students only)
router.post('/upload-picture', auth, upload.single('picture'), async (req, res) => {
  try {
    if (req.userType !== 'student') {
      return res.status(403).json({ message: 'Only students can upload profile pictures' });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'Profile picture file is required' });
    }

    const pictureUrl = `/uploads/${req.file.filename}`;

    const updatedUser = await Student.findByIdAndUpdate(
      req.user._id,
      { profile_picture_url: pictureUrl },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ 
      message: 'Profile picture uploaded successfully', 
      profile_picture_url: pictureUrl 
    });
  } catch (error) {
    console.error('Upload profile picture error:', error);
    res.status(500).json({ message: 'Error uploading profile picture' });
  }
});

// Change password
router.put('/change-password', auth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Current password and new password are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'New password must be at least 6 characters long' });
    }

    const user = req.user;
    const userType = req.userType;

    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update password
    let updatedUser;
    if (userType === 'alumni') {
      updatedUser = await Alumni.findByIdAndUpdate(
        req.user._id,
        { password: hashedPassword },
        { new: true }
      );
    } else if (userType === 'student') {
      updatedUser = await Student.findByIdAndUpdate(
        req.user._id,
        { password: hashedPassword },
        { new: true }
      );
    }

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ message: 'Error changing password' });
  }
});

// Complete alumni profile after resume upload (auto-fill from resume)
router.post('/alumni/complete-profile', auth, async (req, res) => {
  try {
    if (req.userType !== 'alumni') {
      return res.status(403).json({ message: 'Only alumni can complete profile' });
    }

    const { 
      company, 
      role, 
      skills, 
      bio, 
      linkedin, 
      github 
    } = req.body;

    const updates = {};
    if (company) updates.company = company;
    if (role) updates.role = role;
    if (skills) updates.skills = Array.isArray(skills) ? skills : skills.split(',').map(s => s.trim());
    if (bio) updates.bio = bio;
    if (linkedin) updates.linkedin = linkedin;
    if (github) updates.github = github;
    if (Object.keys(updates).length > 0) {
      updates.verified = true; // Mark as verified after profile completion
    }

    const updatedAlumni = await Alumni.findByIdAndUpdate(
      req.user._id,
      updates,
      { new: true }
    );

    if (!updatedAlumni) {
      return res.status(404).json({ message: 'Alumni not found' });
    }

    res.json({ 
      message: 'Profile completed successfully', 
      profile: updatedAlumni 
    });
  } catch (error) {
    console.error('Complete alumni profile error:', error);
    res.status(500).json({ message: 'Error completing profile' });
  }
});

// Complete student profile after OTP verification
router.post('/student/complete-profile', auth, async (req, res) => {
  try {
    if (req.userType !== 'student') {
      return res.status(403).json({ message: 'Only students can complete profile' });
    }

    const { skills, interests } = req.body;

    const updates = {};
    if (skills) updates.skills = Array.isArray(skills) ? skills : skills.split(',').map(s => s.trim());
    if (interests) updates.interests = Array.isArray(interests) ? interests : interests.split(',').map(s => s.trim());

    const updatedStudent = await Student.findByIdAndUpdate(
      req.user._id,
      updates,
      { new: true }
    );

    if (!updatedStudent) {
      return res.status(404).json({ message: 'Student not found' });
    }

    res.json({ 
      message: 'Profile completed successfully', 
      profile: updatedStudent 
    });
  } catch (error) {
    console.error('Complete student profile error:', error);
    res.status(500).json({ message: 'Error completing profile' });
  }
});

module.exports = router;