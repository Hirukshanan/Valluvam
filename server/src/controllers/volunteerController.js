const Volunteer = require('../models/Volunteer');

// ---------------------------------------------------------------------------
// POST /api/volunteers — Submit public volunteer interest form
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
