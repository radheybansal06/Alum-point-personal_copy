const express = require('express');
const { auth } = require('../middleware/auth');
const Alumni = require('../models/Alumni');
const upload = require('../utils/upload');
const resumeParser = require('../utils/resumeParser');
const path = require('path');
const fs = require('fs');

const router = express.Router();

// Get alumni profile
router.get('/profile', auth, async (req, res) => {
  try {
    const alumni = await Alumni.findOne({ email: req.user.email });
    if (!alumni) {
      return res.status(404).json({ message: 'Alumni profile not found' });
    }

    res.json({ alumni });
  } catch (error) {
    console.error('Get alumni profile error:', error);
    res.status(500).json({ message: 'Error fetching alumni profile' });
  }
});

// Update alumni profile
router.put('/profile', auth, async (req, res) => {
  try {
    const updateData = req.body;
    
    const alumni = await Alumni.findOneAndUpdate(
      { email: req.user.email },
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!alumni) {
      return res.status(404).json({ message: 'Alumni profile not found' });
    }

    res.json({ alumni, message: 'Profile updated successfully' });
  } catch (error) {
    console.error('Update alumni profile error:', error);
    res.status(500).json({ message: 'Error updating alumni profile' });
  }
});

// Upload and parse resume
router.post('/upload-resume', auth, upload.single('resume'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Resume file is required' });
    }

    const alumni = await Alumni.findOne({ email: req.user.email });
    if (!alumni) {
      return res.status(404).json({ message: 'Alumni profile not found' });
    }

    const resumePath = req.file.path;
    console.log(`[Alumni] Processing resume upload for ${alumni.email}: ${resumePath}`);

    try {
      // Parse the resume using Python service
      const parsedData = await resumeParser.parseResume(resumePath);
      
      // Update alumni record with parsed data
      const updatedAlumni = await resumeParser.updateAlumniFromResume(alumni._id, parsedData);
      
      // Update resume URL
      updatedAlumni.resume_url = `/uploads/${req.file.filename}`;
      await updatedAlumni.save();

      // Clean up the temporary file
      fs.unlinkSync(resumePath);

      res.json({
        message: 'Resume uploaded and parsed successfully',
        alumni: updatedAlumni,
        parsedData: parsedData
      });

    } catch (parseError) {
      console.error('[Alumni] Resume parsing failed:', parseError);
      
      // Clean up the temporary file on error
      if (fs.existsSync(resumePath)) {
        fs.unlinkSync(resumePath);
      }

      res.status(500).json({
        message: 'Resume upload failed',
        error: parseError.message
      });
    }

  } catch (error) {
    console.error('Upload resume error:', error);
    res.status(500).json({ message: 'Error uploading resume' });
  }
});

// Get parsed resume data
router.get('/resume-data', auth, async (req, res) => {
  try {
    const alumni = await Alumni.findOne({ email: req.user.email });
    if (!alumni) {
      return res.status(404).json({ message: 'Alumni profile not found' });
    }

    const resumeData = {
      professional_summary: alumni.professional_summary,
      contact_details: alumni.contact_details,
      work_history: alumni.work_history,
      education_history: alumni.education_history,
      detailed_skills: alumni.detailed_skills,
      projects: alumni.projects,
      achievements: alumni.achievements
    };

    res.json({ resumeData });
  } catch (error) {
    console.error('Get resume data error:', error);
    res.status(500).json({ message: 'Error fetching resume data' });
  }
});

// Check resume parser dependencies
router.get('/check-dependencies', auth, async (req, res) => {
  try {
    console.log('[Alumni] Checking resume parser dependencies...');
    const dependenciesAvailable = await resumeParser.checkDependencies();
    console.log('[Alumni] Dependencies check result:', dependenciesAvailable);
    
    const response = { 
      dependenciesAvailable,
      message: dependenciesAvailable 
        ? 'Resume parser dependencies are available' 
        : 'Resume parser dependencies are not installed',
      timestamp: new Date().toISOString()
    };
    
    console.log('[Alumni] Sending response:', response);
    res.json(response);
  } catch (error) {
    console.error('[Alumni] Check dependencies error:', error);
    res.status(500).json({ 
      dependenciesAvailable: false,
      message: 'Error checking dependencies',
      error: error.message 
    });
  }
});

module.exports = router;
