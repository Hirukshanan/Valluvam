const Contact = require('../models/Contact');

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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
