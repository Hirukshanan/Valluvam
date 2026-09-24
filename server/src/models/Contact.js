const mongoose = require('mongoose');

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const contactSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: [150, 'Name cannot exceed 150 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      trim: true,
      lowercase: true,
      match: [emailRegex, 'Please provide a valid email address'],
      maxlength: [200, 'Email cannot exceed 200 characters'],
    },
    subject: {
      type: String,
      required: [true, 'Subject is required'],
      trim: true,
      maxlength: [200, 'Subject cannot exceed 200 characters'],
    },
    message: {
      type: String,
      required: [true, 'Message is required'],
      trim: true,
      maxlength: [5000, 'Message cannot exceed 5000 characters'],
    },
    preferredContactMethod: {
      type: String,
      enum: {
        values: ['email', 'whatsapp', 'phone'],
        message: '{VALUE} is not a valid preferred contact method',
      },
      default: 'email',
    },
    whatsappNumber: {
      type: String,
      default: '',
      trim: true,
      maxlength: [50, 'WhatsApp number cannot exceed 50 characters'],
    },
    phoneNumber: {
      type: String,
      default: '',
      trim: true,
      maxlength: [50, 'Phone number cannot exceed 50 characters'],
    },
    status: {
      type: String,
      enum: {
        values: ['new', 'read', 'replied', 'archived'],
        message: '{VALUE} is not a valid status',
      },
      default: 'new',
    },
  },
  {
    timestamps: true, // adds createdAt and updatedAt automatically
  }
);

module.exports = mongoose.model('Contact', contactSchema);
