const mongoose = require('mongoose');
const Contact = require('../models/Contact');
const { verifyTurnstileToken } = require('../utils/turnstile');

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Helper to check valid MongoDB ObjectId
function isValidId(id) {
  return mongoose.Types.ObjectId.isValid(id);
}

// ---------------------------------------------------------------------------
// POST /api/contact — Public endpoint for submitting contact messages
// ---------------------------------------------------------------------------
exports.createContact = async (req, res) => {
  try {
    const {
      name,
      email,
      subject,
      message,
      preferredContactMethod = 'email',
      whatsappNumber,
      phoneNumber,
      turnstileToken,
    } = req.body;

    const errors = [];

    // Basic field validations
    if (!name || typeof name !== 'string' || !name.trim()) {
      errors.push('Full name is required');
    }
    if (!email || typeof email !== 'string' || !email.trim()) {
      errors.push('Email address is required');
    } else if (!emailRegex.test(email.trim())) {
      errors.push('Please provide a valid email address');
    }
    if (!subject || typeof subject !== 'string' || !subject.trim()) {
      errors.push('Subject is required');
    }
    if (!message || typeof message !== 'string' || !message.trim()) {
      errors.push('Message is required');
    }

    const validMethods = ['email', 'whatsapp', 'phone'];
    const method = validMethods.includes(preferredContactMethod)
      ? preferredContactMethod
      : 'email';

    // Conditional contact method validations
    if (method === 'whatsapp') {
      if (!whatsappNumber || typeof whatsappNumber !== 'string' || !whatsappNumber.trim()) {
        errors.push('WhatsApp number is required when WhatsApp is selected');
      }
    } else if (method === 'phone') {
      if (!phoneNumber || typeof phoneNumber !== 'string' || !phoneNumber.trim()) {
        errors.push('Phone number is required when Phone is selected');
      }
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

    // Duplicate message prevention (within 2 minutes)
    const twoMinutesAgo = new Date(Date.now() - 2 * 60 * 1000);
    const existingDuplicate = await Contact.findOne({
      email: email.trim().toLowerCase(),
      subject: subject.trim(),
      message: message.trim(),
      createdAt: { $gte: twoMinutesAgo },
    });

    if (existingDuplicate) {
      return res.status(409).json({
        success: false,
        message: 'This exact message was already received recently. Please wait a moment before sending again.',
      });
    }

    const contact = await Contact.create({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      subject: subject.trim(),
      message: message.trim(),
      preferredContactMethod: method,
      whatsappNumber: whatsappNumber ? String(whatsappNumber).trim() : '',
      phoneNumber: phoneNumber ? String(phoneNumber).trim() : '',
      status: 'new',
    });

    res.status(201).json({
      success: true,
      message: 'Message sent successfully',
      data: contact,
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

    console.error('Create contact error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while sending message',
    });
  }
};

// ---------------------------------------------------------------------------
// GET /api/contact — Get all contact messages (admin only)
// ---------------------------------------------------------------------------
exports.getAllContacts = async (req, res) => {
  try {
    const query = {};
    if (req.query.status) {
      query.status = req.query.status;
    }

    const contacts = await Contact.find(query).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: contacts.length,
      data: contacts,
    });
  } catch (error) {
    console.error('Get all contacts error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching contact messages',
    });
  }
};

// ---------------------------------------------------------------------------
// GET /api/contact/:id — Get a single contact message by ID (admin only)
// ---------------------------------------------------------------------------
exports.getContactById = async (req, res) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid contact message ID format',
      });
    }

    const contact = await Contact.findById(req.params.id);

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Contact message not found',
      });
    }

    res.status(200).json({
      success: true,
      data: contact,
    });
  } catch (error) {
    console.error('Get contact by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching contact message',
    });
  }
};

// ---------------------------------------------------------------------------
// PUT /api/contact/:id — Update contact message status (admin only)
// ---------------------------------------------------------------------------
exports.updateContact = async (req, res) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid contact message ID format',
      });
    }

    const allowedStatuses = ['new', 'read', 'replied', 'archived'];
    if (req.body.status && !allowedStatuses.includes(req.body.status)) {
      return res.status(400).json({
        success: false,
        message: `Status must be one of: ${allowedStatuses.join(', ')}`,
      });
    }

    const contact = await Contact.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Contact message not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Contact message status updated successfully',
      data: contact,
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

    console.error('Update contact error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating contact message',
    });
  }
};

// ---------------------------------------------------------------------------
// DELETE /api/contact/:id — Delete a contact message (admin only)
// ---------------------------------------------------------------------------
exports.deleteContact = async (req, res) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid contact message ID format',
      });
    }

    const contact = await Contact.findByIdAndDelete(req.params.id);

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Contact message not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Contact message deleted successfully',
    });
  } catch (error) {
    console.error('Delete contact error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting contact message',
    });
  }
};

