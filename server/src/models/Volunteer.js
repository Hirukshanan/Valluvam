const mongoose = require('mongoose');

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const volunteerSchema = new mongoose.Schema(
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
    phone: {
      type: String,
      default: '',
      trim: true,
      maxlength: [50, 'Phone number cannot exceed 50 characters'],
    },
    location: {
      type: String,
      default: '',
      trim: true,
      maxlength: [200, 'Location cannot exceed 200 characters'],
    },
    volunteerArea: {
      type: String,
      default: '',
      trim: true,
      maxlength: [200, 'Volunteer area cannot exceed 200 characters'],
    },
    availability: {
      type: String,
      default: '',
      trim: true,
      maxlength: [100, 'Availability cannot exceed 100 characters'],
    },
    message: {
      type: String,
      required: [true, 'Message is required'],
      trim: true,
      maxlength: [3000, 'Message cannot exceed 3000 characters'],
    },
    status: {
      type: String,
      enum: {
        values: ['new', 'contacted', 'archived'],
        message: '{VALUE} is not a valid status',
      },
      default: 'new',
    },
  },
  {
    timestamps: true, // creates createdAt and updatedAt
  }
);

module.exports = mongoose.model('Volunteer', volunteerSchema);
