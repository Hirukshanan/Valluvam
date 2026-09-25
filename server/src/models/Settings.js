const mongoose = require('mongoose');

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Verified Valluvam organization default values
const DEFAULT_SETTINGS = {
  organizationName: 'Valluvam',
  slogan: 'Let all your thoughts be set on high aspirations',
  establishedDate: '28 March 2025',
  email: 'valluvamofficial@gmail.com',
  location: 'Pandiruppu, Kalmunai, Ampara District, Sri Lanka',
  facebookUrl: 'https://www.facebook.com/share/1Hw92m6QP2/',
  instagramUrl: 'https://www.instagram.com/valluvam_official_?stkn=bHRjMzZiNzc4ZTZr',
};

const settingsSchema = new mongoose.Schema(
  {
    organizationName: {
      type: String,
      required: [true, 'Organization name is required'],
      trim: true,
      default: DEFAULT_SETTINGS.organizationName,
      maxlength: [150, 'Organization name cannot exceed 150 characters'],
    },
    slogan: {
      type: String,
      trim: true,
      default: DEFAULT_SETTINGS.slogan,
      maxlength: [300, 'Slogan cannot exceed 300 characters'],
    },
    establishedDate: {
      type: String,
      trim: true,
      default: DEFAULT_SETTINGS.establishedDate,
      maxlength: [100, 'Established date cannot exceed 100 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      trim: true,
      lowercase: true,
      default: DEFAULT_SETTINGS.email,
      match: [emailRegex, 'Please provide a valid email address'],
      maxlength: [200, 'Email cannot exceed 200 characters'],
    },
    location: {
      type: String,
      trim: true,
      default: DEFAULT_SETTINGS.location,
      maxlength: [300, 'Location cannot exceed 300 characters'],
    },
    facebookUrl: {
      type: String,
      trim: true,
      default: DEFAULT_SETTINGS.facebookUrl,
      maxlength: [500, 'Facebook URL cannot exceed 500 characters'],
    },
    instagramUrl: {
      type: String,
      trim: true,
      default: DEFAULT_SETTINGS.instagramUrl,
      maxlength: [500, 'Instagram URL cannot exceed 500 characters'],
    },
  },
  {
    timestamps: true, // creates createdAt and updatedAt
  }
);

const Settings = mongoose.model('Settings', settingsSchema);

module.exports = {
  Settings,
  DEFAULT_SETTINGS,
};
