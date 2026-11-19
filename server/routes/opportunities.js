const express = require('express');
const { auth, requireAlumni, requireStudent } = require('../middleware/auth');
const Opportunity = require('../models/Opportunity');
const Alumni = require('../models/Alumni');
const Student = require('../models/Student');

const router = express.Router();

// Create opportunity (Alumni only)
router.post('/', auth, requireAlumni, async (req, res) => {
  try {
    const {
      title,
      description,
      type,
      company,
      location,
      skills_required,
      experience_level,
      salary_range,
      application_deadline
    } = req.body;

    if (!title || !description || !type || !company) {
      return res.status(400).json({ message: 'Title, description, type, and company are required' });
    }

    const opportunity = new Opportunity({
      title,
      description,
      type,
      company,
      location: location || '',
      skills_required: skills_required || [],
      experience_level: experience_level || 'entry',
      salary_range: salary_range || '',
      application_deadline: application_deadline ? new Date(application_deadline) : null,
      posted_by: req.user.id
    });

    await opportunity.save();
    res.json({ message: 'Opportunity created successfully', opportunity });
  } catch (error) {
    console.error('Create opportunity error:', error);
    res.status(500).json({ message: 'Error creating opportunity' });
  }
});

// Get all opportunities (Students and Alumni)
router.get('/', auth, async (req, res) => {
  try {
    const { type, company, skills, experience_level, page = 1, limit = 10 } = req.query;

    const query = { is_active: true };

    if (type) {
      query.type = type;
    }

    if (company) {
      query.company = { $regex: company, $options: 'i' };
    }

    if (skills) {
      const skillsArray = skills.split(',');
      query.skills_required = { $in: skillsArray };
    }

    if (experience_level) {
      query.experience_level = experience_level;
    }

    const opportunities = await Opportunity.find(query)
      .populate('posted_by', 'first_name last_name company role')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Opportunity.countDocuments(query);

    res.json({
      opportunities,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Get opportunities error:', error);
    res.status(500).json({ message: 'Error fetching opportunities' });
  }
});

// Get opportunity by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;

    const opportunity = await Opportunity.findById(id)
      .populate('posted_by', 'first_name last_name company role linkedin github')
      .populate('applications.student_id', 'first_name last_name email skills grad_year_expected department');

    if (!opportunity) {
      return res.status(404).json({ message: 'Opportunity not found' });
    }

    res.json({ opportunity });
  } catch (error) {
    console.error('Get opportunity error:', error);
    res.status(500).json({ message: 'Error fetching opportunity' });
  }
});

// Apply to opportunity (Student only)
router.post('/:id/apply', auth, requireStudent, async (req, res) => {
  try {
    const { id } = req.params;
    const { cover_letter } = req.body;

    const opportunity = await Opportunity.findById(id);

    if (!opportunity) {
      return res.status(404).json({ message: 'Opportunity not found' });
    }

    if (!opportunity.is_active) {
      return res.status(400).json({ message: 'This opportunity is no longer active' });
    }

    // Check if application deadline has passed
    if (opportunity.application_deadline && new Date() > opportunity.application_deadline) {
      return res.status(400).json({ message: 'Application deadline has passed' });
    }

    // Check if student has already applied
    const existingApplication = opportunity.applications.find(
      app => app.student_id === req.user.id
    );

    if (existingApplication) {
      return res.status(400).json({ message: 'You have already applied to this opportunity' });
    }

    // Add application
    opportunity.applications.push({
      student_id: req.user.id,
      cover_letter: cover_letter || '',
      status: 'pending'
    });

    await opportunity.save();

    res.json({ message: 'Application submitted successfully' });
  } catch (error) {
    console.error('Apply to opportunity error:', error);
    res.status(500).json({ message: 'Error applying to opportunity' });
  }
});

// Get my opportunities (Alumni only)
router.get('/my/opportunities', auth, requireAlumni, async (req, res) => {
  try {
    const opportunities = await Opportunity.find({ posted_by: req.user.id })
      .populate('applications.student_id', 'first_name last_name email skills grad_year_expected department')
      .sort({ createdAt: -1 });

    res.json({ opportunities });
  } catch (error) {
    console.error('Get my opportunities error:', error);
    res.status(500).json({ message: 'Error fetching your opportunities' });
  }
});

// Get my applications (Student only)
router.get('/my/applications', auth, requireStudent, async (req, res) => {
  try {
    const opportunities = await Opportunity.find({
      'applications.student_id': req.user.id
    })
      .populate('posted_by', 'first_name last_name company role')
      .sort({ 'applications.applied_at': -1 });

    // Filter to only show applications from this student
    const applications = opportunities.map(opp => {
      const application = opp.applications.find(app => app.student_id === req.user.id);
      return {
        opportunity: {
          id: opp.id,
          title: opp.title,
          company: opp.company,
          type: opp.type,
          location: opp.location,
          posted_by: opp.posted_by
        },
        application: {
          status: application.status,
          applied_at: application.applied_at,
          cover_letter: application.cover_letter
        }
      };
    });

    res.json({ applications });
  } catch (error) {
    console.error('Get my applications error:', error);
    res.status(500).json({ message: 'Error fetching your applications' });
  }
});

// Update application status (Alumni only)
router.put('/:id/applications/:applicationId', auth, requireAlumni, async (req, res) => {
  try {
    const { id, applicationId } = req.params;
    const { status } = req.body;

    if (!['accepted', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const opportunity = await Opportunity.findOne({
      _id: id,
      posted_by: req.user.id
    });

    if (!opportunity) {
      return res.status(404).json({ message: 'Opportunity not found' });
    }

    const application = opportunity.applications.id(applicationId);
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    application.status = status;
    await opportunity.save();

    res.json({ message: 'Application status updated successfully' });
  } catch (error) {
    console.error('Update application status error:', error);
    res.status(500).json({ message: 'Error updating application status' });
  }
});

// Update opportunity (Alumni only)
router.put('/:id', auth, requireAlumni, async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const opportunity = await Opportunity.findOneAndUpdate(
      { _id: id, posted_by: req.user.id },
      updates,
      { new: true }
    );

    if (!opportunity) {
      return res.status(404).json({ message: 'Opportunity not found' });
    }

    res.json({ message: 'Opportunity updated successfully', opportunity });
  } catch (error) {
    console.error('Update opportunity error:', error);
    res.status(500).json({ message: 'Error updating opportunity' });
  }
});

// Delete opportunity (Alumni only)
router.delete('/:id', auth, requireAlumni, async (req, res) => {
  try {
    const { id } = req.params;

    const opportunity = await Opportunity.findOneAndUpdate(
      { _id: id, posted_by: req.user.id },
      { is_active: false },
      { new: true }
    );

    if (!opportunity) {
      return res.status(404).json({ message: 'Opportunity not found' });
    }

    res.json({ message: 'Opportunity deleted successfully' });
  } catch (error) {
    console.error('Delete opportunity error:', error);
    res.status(500).json({ message: 'Error deleting opportunity' });
  }
});

module.exports = router;