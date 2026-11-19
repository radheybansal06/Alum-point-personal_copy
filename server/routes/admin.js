const express = require('express');
const bcrypt = require('bcryptjs');
const csv = require('csv-parser');
const fs = require('fs');
const { auth, requireAdmin } = require('../middleware/auth');
const Alumni = require('../models/Alumni');
const Student = require('../models/Student');
const Event = require('../models/Event');
const Announcement = require('../models/Announcement');
const { sendAlumniInvite } = require('../utils/email');
const upload = require('../utils/upload');

const router = express.Router();

// Upload alumni CSV
router.post('/upload-alumni', auth, requireAdmin, upload.single('csv'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'CSV file is required' });
    }

    const results = [];
    const errors = [];
    const invites = [];

    // Parse CSV file
    fs.createReadStream(req.file.path)
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', async () => {
        try {
          for (const row of results) {
            try {
              // Validate required fields (only essential fields needed)
              if (!row.email || !row.first_name || !row.last_name || !row.roll_no || !row.grad_year || !row.department) {
                errors.push(`Row ${results.indexOf(row) + 1}: Missing required fields (email, first_name, last_name, roll_no, grad_year, department)`);
                continue;
              }

              // Check if alumni already exists
              const existingAlumni = await Alumni.findOne({ 
                $or: [{ email: row.email }, { roll_no: row.roll_no }] 
              });

              if (existingAlumni) {
                errors.push(`Row ${results.indexOf(row) + 1}: Alumni already exists with email ${row.email} or roll number ${row.roll_no}`);
                continue;
              }

              // Generate username and password
              const username = `${row.first_name.toLowerCase()}.${row.last_name.toLowerCase()}.${row.roll_no}`;
              const password = Math.random().toString(36).slice(-8);
              const hashedPassword = await bcrypt.hash(password, 10);

              // Create alumni with only essential fields (other fields will be filled by resume parser)
              const alumni = new Alumni({
                roll_no: row.roll_no,
                first_name: row.first_name,
                last_name: row.last_name,
                email: row.email,
                password: hashedPassword,
                grad_year: parseInt(row.grad_year),
                department: row.department
                // Other fields (company, role, skills, bio, etc.) will be populated by resume parser
              });

              await alumni.save();

              // Send invite email
              const emailSent = await sendAlumniInvite(row.email, username, password);
              if (emailSent) {
                invites.push({ email: row.email, username, password });
              } else {
                errors.push(`Row ${results.indexOf(row) + 1}: Failed to send invite email to ${row.email}`);
              }

            } catch (error) {
              errors.push(`Row ${results.indexOf(row) + 1}: ${error.message}`);
            }
          }

          // Clean up uploaded file
          fs.unlinkSync(req.file.path);

          res.json({
            message: 'CSV processing completed',
            total_rows: results.length,
            successful_invites: invites.length,
            errors: errors,
            invites: invites
          });

        } catch (error) {
          console.error('CSV processing error:', error);
          res.status(500).json({ message: 'Error processing CSV file' });
        }
      });
  } catch (error) {
    console.error('Upload alumni error:', error);
    res.status(500).json({ message: 'Error uploading alumni data' });
  }
});

// Create event
router.post('/events', auth, requireAdmin, async (req, res) => {
  try {
    const { title, description, date, location, type, max_attendees } = req.body;

    if (!title || !description || !date || !location || !type) {
      return res.status(400).json({ message: 'All required fields must be provided' });
    }

    const event = new Event({
      title,
      description,
      date: new Date(date),
      location,
      type,
      max_attendees: max_attendees ? parseInt(max_attendees) : null,
      created_by: req.user.id
    });

    await event.save();
    res.json({ message: 'Event created successfully', event });
  } catch (error) {
    console.error('Create event error:', error);
    res.status(500).json({ message: 'Error creating event' });
  }
});

// Get all events (admin only)
router.get('/events', auth, requireAdmin, async (req, res) => {
  try {
    const events = await Event.find({ is_active: true })
      .sort({ date: 1 });
    res.json({ events });
  } catch (error) {
    console.error('Get events error:', error);
    res.status(500).json({ message: 'Error fetching events' });
  }
});

// Get public events (for students and alumni)
router.get('/public/events', auth, async (req, res) => {
  try {
    const events = await Event.find({ is_active: true })
      .sort({ date: 1 })
      .select('title description date location type max_attendees created_at');
    res.json({ events });
  } catch (error) {
    console.error('Get public events error:', error);
    res.status(500).json({ message: 'Error fetching events' });
  }
});

// Update event
router.put('/events/:id', auth, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const event = await Event.findOneAndUpdate(
      { _id: id, created_by: req.user.id },
      updates,
      { new: true }
    );

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    res.json({ message: 'Event updated successfully', event });
  } catch (error) {
    console.error('Update event error:', error);
    res.status(500).json({ message: 'Error updating event' });
  }
});

// Delete event
router.delete('/events/:id', auth, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const event = await Event.findOneAndUpdate(
      { _id: id, created_by: req.user.id },
      { is_active: false },
      { new: true }
    );

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    res.json({ message: 'Event deleted successfully' });
  } catch (error) {
    console.error('Delete event error:', error);
    res.status(500).json({ message: 'Error deleting event' });
  }
});

// Create announcement
router.post('/announcements', auth, requireAdmin, async (req, res) => {
  try {
    const { title, content, priority, target_audience, expires_at } = req.body;

    if (!title || !content) {
      return res.status(400).json({ message: 'Title and content are required' });
    }

    const announcement = new Announcement({
      title,
      content,
      priority: priority || 'medium',
      target_audience: target_audience || 'all',
      created_by: req.user.id,
      expires_at: expires_at ? new Date(expires_at) : null
    });

    await announcement.save();
    res.json({ message: 'Announcement created successfully', announcement });
  } catch (error) {
    console.error('Create announcement error:', error);
    res.status(500).json({ message: 'Error creating announcement' });
  }
});

// Get all announcements (Admin only)
router.get('/announcements', auth, requireAdmin, async (req, res) => {
  try {
    const announcements = await Announcement.find({ is_active: true })
      .sort({ createdAt: -1 });
    res.json({ announcements });
  } catch (error) {
    console.error('Get announcements error:', error);
    res.status(500).json({ message: 'Error fetching announcements' });
  }
});

// Update announcement
router.put('/announcements/:id', auth, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const announcement = await Announcement.findOneAndUpdate(
      { _id: id, created_by: req.user.id },
      updates,
      { new: true }
    );

    if (!announcement) {
      return res.status(404).json({ message: 'Announcement not found' });
    }

    res.json({ message: 'Announcement updated successfully', announcement });
  } catch (error) {
    console.error('Update announcement error:', error);
    res.status(500).json({ message: 'Error updating announcement' });
  }
});

// Delete announcement
router.delete('/announcements/:id', auth, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const announcement = await Announcement.findOneAndUpdate(
      { _id: id, created_by: req.user.id },
      { is_active: false },
      { new: true }
    );

    if (!announcement) {
      return res.status(404).json({ message: 'Announcement not found' });
    }

    res.json({ message: 'Announcement deleted successfully' });
  } catch (error) {
    console.error('Delete announcement error:', error);
    res.status(500).json({ message: 'Error deleting announcement' });
  }
});

// Get dashboard stats
router.get('/dashboard', auth, requireAdmin, async (req, res) => {
  try {
    const totalAlumni = await Alumni.countDocuments();
    const totalStudents = await Student.countDocuments();
    const totalEvents = await Event.countDocuments({ is_active: true });
    const totalAnnouncements = await Announcement.countDocuments({ is_active: true });

    res.json({
      stats: {
        totalAlumni,
        totalStudents,
        totalEvents,
        totalAnnouncements
      }
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({ message: 'Error fetching dashboard stats' });
  }
});

module.exports = router;