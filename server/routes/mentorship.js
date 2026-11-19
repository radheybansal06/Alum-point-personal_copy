const express = require('express');
const { auth, requireStudent, requireAlumni } = require('../middleware/auth');
const Mentorship = require('../models/Mentorship');
const Alumni = require('../models/Alumni');
const Student = require('../models/Student');
const axios = require('axios');

const router = express.Router();

// Search mentors using LLM stub
router.post('/search', auth, async (req, res) => {
  try {
    const { query } = req.body;

    if (!query) {
      return res.status(400).json({ message: 'Search query is required' });
    }

    // Call LLM wrapper to extract filters
    const llmResponse = await axios.post(`${process.env.API_URL || 'http://localhost:5000'}/api/llm/extract`, {
      query
    });

    const { skills, company, grad_year, role } = llmResponse.data;

    // Build MongoDB query
    const mongoQuery = { verified: true };

    if (skills.length > 0) {
      mongoQuery.skills = { $in: skills };
    }

    if (company.length > 0) {
      mongoQuery.company = { $in: company };
    }

    if (grad_year.length > 0) {
      mongoQuery.grad_year = { $in: grad_year };
    }

    if (role.length > 0) {
      mongoQuery.role = { $in: role };
    }

    // Find matching alumni
    const mentors = await Alumni.find(mongoQuery)
      .select('id first_name last_name company role skills grad_year bio linkedin github karma_points')
      .limit(20);

    res.json({ mentors });
  } catch (error) {
    console.error('Mentor search error:', error);
    res.status(500).json({ message: 'Error searching mentors' });
  }
});

// Request mentorship (Student only)
router.post('/request', auth, requireStudent, async (req, res) => {
  try {
    const { alumni_id, message } = req.body;

    if (!alumni_id || !message) {
      return res.status(400).json({ message: 'Alumni ID and message are required' });
    }

    // Check if alumni exists
    const alumni = await Alumni.findById(alumni_id);
    if (!alumni) {
      return res.status(404).json({ message: 'Alumni not found' });
    }

    // Check if request already exists
    const existingRequest = await Mentorship.findOne({
      student_id: req.user.id,
      alumni_id: alumni_id,
      status: { $in: ['pending', 'accepted'] }
    });

    if (existingRequest) {
      return res.status(400).json({ message: 'Mentorship request already exists' });
    }

    // Create mentorship request
    const mentorship = new Mentorship({
      student_id: req.user.id,
      alumni_id: alumni_id,
      request_message: message
    });

    await mentorship.save();

    res.json({ message: 'Mentorship request sent successfully' });
  } catch (error) {
    console.error('Mentorship request error:', error);
    res.status(500).json({ message: 'Error sending mentorship request' });
  }
});

// Get mentorship requests for alumni
router.get('/requests', auth, requireAlumni, async (req, res) => {
  try {
    const requests = await Mentorship.find({ alumni_id: req.user.id })
      .populate('student_id', 'first_name last_name email skills interests grad_year_expected department')
      .sort({ requested_at: -1 });

    res.json({ requests });
  } catch (error) {
    console.error('Get mentorship requests error:', error);
    res.status(500).json({ message: 'Error fetching mentorship requests' });
  }
});

// Respond to mentorship request (Alumni only)
router.post('/respond', auth, requireAlumni, async (req, res) => {
  try {
    const { mentorship_id, status, response_message } = req.body;

    if (!mentorship_id || !status) {
      return res.status(400).json({ message: 'Mentorship ID and status are required' });
    }

    if (!['accepted', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const mentorship = await Mentorship.findOne({
      _id: mentorship_id,
      alumni_id: req.user.id,
      status: 'pending'
    });

    if (!mentorship) {
      return res.status(404).json({ message: 'Mentorship request not found' });
    }

    mentorship.status = status;
    mentorship.response_message = response_message || '';
    mentorship.responded_at = new Date();

    await mentorship.save();

    res.json({ message: `Mentorship request ${status} successfully` });
  } catch (error) {
    console.error('Mentorship response error:', error);
    res.status(500).json({ message: 'Error responding to mentorship request' });
  }
});

// Get mentorship conversations
router.get('/conversations', auth, async (req, res) => {
  try {
    let query = {};
    
    if (req.userType === 'student') {
      query.student_id = req.user.id;
    } else if (req.userType === 'alumni') {
      query.alumni_id = req.user.id;
    }

    const conversations = await Mentorship.find({
      ...query,
      status: 'accepted'
    })
      .populate('student_id', 'first_name last_name email')
      .populate('alumni_id', 'first_name last_name email')
      .sort({ updatedAt: -1 });

    res.json({ conversations });
  } catch (error) {
    console.error('Get conversations error:', error);
    res.status(500).json({ message: 'Error fetching conversations' });
  }
});

// Send message in mentorship chat
router.post('/message', auth, async (req, res) => {
  try {
    const { mentorship_id, message } = req.body;

    if (!mentorship_id || !message) {
      return res.status(400).json({ message: 'Mentorship ID and message are required' });
    }

    const mentorship = await Mentorship.findOne({
      _id: mentorship_id,
      status: 'accepted',
      $or: [
        { student_id: req.user.id },
        { alumni_id: req.user.id }
      ]
    });

    if (!mentorship) {
      return res.status(404).json({ message: 'Mentorship not found or not authorized' });
    }

    const senderType = req.userType === 'student' ? 'student' : 'alumni';

    mentorship.chat_messages.push({
      sender_id: req.user.id,
      sender_type: senderType,
      message: message
    });

    await mentorship.save();

    res.json({ message: 'Message sent successfully' });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ message: 'Error sending message' });
  }
});

module.exports = router;