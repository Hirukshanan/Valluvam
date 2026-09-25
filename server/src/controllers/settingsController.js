const { Settings, DEFAULT_SETTINGS } = require('../models/Settings');

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// ---------------------------------------------------------------------------
// GET /api/settings — Public endpoint for retrieving organization settings
// ---------------------------------------------------------------------------
exports.getSettings = async (req, res) => {
  try {
    let settings = await Settings.findOne();

    // Auto-initialize with default verified Valluvam settings if none exists yet
    if (!settings) {
      settings = await Settings.create(DEFAULT_SETTINGS);
    }

    res.status(200).json({
      success: true,
      data: settings,
    });
  } catch (error) {
    console.error('Get settings error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching organization settings',
    });
  }
};

// ---------------------------------------------------------------------------
// PUT /api/settings — Admin-only endpoint for updating organization settings
// ---------------------------------------------------------------------------
exports.updateSettings = async (req, res) => {
  try {
    const {
      organizationName,
      slogan,
      establishedDate,
      email,
      location,
      facebookUrl,
      instagramUrl,
    } = req.body;

    const errors = [];

    // Basic validation
    if (organizationName !== undefined) {
      if (typeof organizationName !== 'string' || !organizationName.trim()) {
        errors.push('Organization name cannot be empty');
      } else if (organizationName.trim().length > 150) {
        errors.push('Organization name cannot exceed 150 characters');
      }
    }

    if (email !== undefined) {
      if (typeof email !== 'string' || !email.trim()) {
        errors.push('Email address cannot be empty');
      } else if (!emailRegex.test(email.trim())) {
        errors.push('Please provide a valid email address');
      }
    }

    if (slogan !== undefined && typeof slogan === 'string' && slogan.trim().length > 300) {
      errors.push('Slogan cannot exceed 300 characters');
    }

    if (location !== undefined && typeof location === 'string' && location.trim().length > 300) {
      errors.push('Location cannot exceed 300 characters');
    }

    if (facebookUrl !== undefined && typeof facebookUrl === 'string' && facebookUrl.trim()) {
      if (facebookUrl.trim().length > 500) {
        errors.push('Facebook URL cannot exceed 500 characters');
      }
    }

    if (instagramUrl !== undefined && typeof instagramUrl === 'string' && instagramUrl.trim()) {
      if (instagramUrl.trim().length > 500) {
        errors.push('Instagram URL cannot exceed 500 characters');
      }
    }

    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors,
      });
    }

    // Find the single active settings document or create if none exists
    let settings = await Settings.findOne();
    if (!settings) {
      settings = new Settings(DEFAULT_SETTINGS);
    }

    if (organizationName !== undefined) settings.organizationName = organizationName.trim();
    if (slogan !== undefined) settings.slogan = slogan.trim();
    if (establishedDate !== undefined) settings.establishedDate = establishedDate.trim();
    if (email !== undefined) settings.email = email.trim().toLowerCase();
    if (location !== undefined) settings.location = location.trim();
    if (facebookUrl !== undefined) settings.facebookUrl = facebookUrl.trim();
    if (instagramUrl !== undefined) settings.instagramUrl = instagramUrl.trim();

    await settings.save();

    res.status(200).json({
      success: true,
      message: 'Organization settings updated successfully',
      data: settings,
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

    console.error('Update settings error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating organization settings',
    });
  }
};
