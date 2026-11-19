const express = require('express');
const { auth } = require('../middleware/auth');
const Announcement = require('../models/Announcement');

const router = express.Router();

// Get announcements for students/alumni (public read-only)
router.get('/', auth, async (req, res) => {
  try {
    const { target_audience } = req.query;
    const userType = req.userType;

    // Build query based on user type and target audience
    let query = { is_active: true };
    
    // Check if announcement has expired
    query.$or = [
      { expires_at: null },
      { expires_at: { $gt: new Date() } }
    ];

    // Filter by target audience
    if (target_audience && target_audience !== 'all') {
      query.target_audience = { $in: ['all', target_audience] };
    } else if (userType === 'student') {
      query.target_audience = { $in: ['all', 'students'] };
    } else if (userType === 'alumni') {
      query.target_audience = { $in: ['all', 'alumni'] };
    }

    const announcements = await Announcement.find(query)
      .sort({ priority: -1, createdAt: -1 }) // High priority first, then newest
      .limit(20);

    res.json({ announcements });
  } catch (error) {
    console.error('Get announcements error:', error);
    res.status(500).json({ message: 'Error fetching announcements' });
  }
});

// Get announcement by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const userType = req.userType;

    const announcement = await Announcement.findOne({
      _id: id,
      is_active: true,
      $or: [
        { expires_at: null },
        { expires_at: { $gt: new Date() } }
      ]
    });

    if (!announcement) {
      return res.status(404).json({ message: 'Announcement not found' });
    }

    // Check if user can view this announcement
    if (announcement.target_audience !== 'all') {
      if (userType === 'student' && announcement.target_audience !== 'students') {
        return res.status(403).json({ message: 'Not authorized to view this announcement' });
      }
      if (userType === 'alumni' && announcement.target_audience !== 'alumni') {
        return res.status(403).json({ message: 'Not authorized to view this announcement' });
      }
    }

    res.json({ announcement });
  } catch (error) {
    console.error('Get announcement error:', error);
    res.status(500).json({ message: 'Error fetching announcement' });
  }
});

module.exports = router;
