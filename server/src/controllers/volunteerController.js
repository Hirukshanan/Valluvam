const mongoose = require('mongoose');
const Volunteer = require('../models/Volunteer');
const { verifyTurnstileToken } = require('../utils/turnstile');

// Helper to check valid MongoDB ObjectId
function isValidId(id) {
  return mongoose.Types.ObjectId.isValid(id);
}

// ---------------------------------------------------------------------------
// POST /api/volunteers — Submit public volunteer interest form (public)
// ---------------------------------------------------------------------------
exports.createVolunteer = async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      location,
      volunteerArea,
      availability,
      message,
      turnstileToken,
    } = req.body;

    // Field validations
    const errors = [];
    if (!name || typeof name !== 'string' || !name.trim()) {
      errors.push('Name is required');
    }
    if (!email || typeof email !== 'string' || !email.trim()) {
      errors.push('Email is required');
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email.trim())) {
        errors.push('Please provide a valid email address');
      }
    }
    if (!message || typeof message !== 'string' || !message.trim()) {
      errors.push('Message is required');
    }

    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors,
      });
    }

    // -------------------------------------------------------------------------
    // Cloudflare Turnstile token validation
    // -------------------------------------------------------------------------
    const token = turnstileToken || req.body['cf-turnstile-response'];
    if (!token || typeof token !== 'string' || !token.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Security verification is required. Please complete the security check.',
        errors: ['Security verification is required'],
      });
    }

    const clientIp =
      req.headers['cf-connecting-ip'] ||
      req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
      req.socket?.remoteAddress;

    const turnstileResult = await verifyTurnstileToken(token.trim(), clientIp);

    if (!turnstileResult.success) {
      return res.status(400).json({
        success: false,
        message: turnstileResult.message || 'Security verification failed',
        errors: [turnstileResult.message || 'Security verification failed'],
      });
    }

    const volunteer = await Volunteer.create({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone ? String(phone).trim() : '',
      location: location ? String(location).trim() : '',
      volunteerArea: volunteerArea ? String(volunteerArea).trim() : '',
      availability: availability ? String(availability).trim() : '',
      message: message.trim(),
      status: 'new',
    });

    res.status(201).json({
      success: true,
      message: 'Volunteer application submitted successfully',
      data: volunteer,
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: messages,
      });
    }

    console.error('Create volunteer error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while submitting volunteer interest',
    });
  }
};

// ---------------------------------------------------------------------------
// GET /api/volunteers — Get all volunteer submissions (admin only)
// ---------------------------------------------------------------------------
exports.getAllVolunteers = async (req, res) => {
  try {
    const query = {};
    if (req.query.status) {
      query.status = req.query.status;
    }

    const volunteers = await Volunteer.find(query).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: volunteers.length,
      data: volunteers,
    });
  } catch (error) {
    console.error('Get all volunteers error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching volunteer submissions',
    });
  }
};

// ---------------------------------------------------------------------------
// GET /api/volunteers/:id — Get a single volunteer submission by ID (admin only)
// ---------------------------------------------------------------------------
exports.getVolunteerById = async (req, res) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid volunteer ID format',
      });
    }

    const volunteer = await Volunteer.findById(req.params.id);

    if (!volunteer) {
      return res.status(404).json({
        success: false,
        message: 'Volunteer submission not found',
      });
    }

    res.status(200).json({
      success: true,
      data: volunteer,
    });
  } catch (error) {
    console.error('Get volunteer by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching volunteer submission',
    });
  }
};

// ---------------------------------------------------------------------------
// PUT /api/volunteers/:id — Update volunteer submission status (admin only)
// ---------------------------------------------------------------------------
exports.updateVolunteer = async (req, res) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid volunteer ID format',
      });
    }

    const allowedStatuses = ['new', 'reviewed', 'contacted', 'archived'];
    if (req.body.status && !allowedStatuses.includes(req.body.status)) {
      return res.status(400).json({
        success: false,
        message: `Status must be one of: ${allowedStatuses.join(', ')}`,
      });
    }

    const volunteer = await Volunteer.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!volunteer) {
      return res.status(404).json({
        success: false,
        message: 'Volunteer submission not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Volunteer status updated successfully',
      data: volunteer,
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: messages,
      });
    }

    console.error('Update volunteer error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating volunteer submission',
    });
  }
};

// ---------------------------------------------------------------------------
// DELETE /api/volunteers/:id — Delete a volunteer submission (admin only)
// ---------------------------------------------------------------------------
exports.deleteVolunteer = async (req, res) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid volunteer ID format',
      });
    }

    const volunteer = await Volunteer.findByIdAndDelete(req.params.id);

    if (!volunteer) {
      return res.status(404).json({
        success: false,
        message: 'Volunteer submission not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Volunteer submission deleted successfully',
    });
  } catch (error) {
    console.error('Delete volunteer error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting volunteer submission',
    });
  }
};
