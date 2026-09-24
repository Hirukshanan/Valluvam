const mongoose = require('mongoose');
const Team = require('../models/Team');
const { uploadStream, deleteCloudinaryAsset } = require('../config/cloudinary');

// ---------------------------------------------------------------------------
// Helper — check if a string is a valid MongoDB ObjectId
// ---------------------------------------------------------------------------
function isValidId(id) {
  return mongoose.Types.ObjectId.isValid(id);
}

// ---------------------------------------------------------------------------
// POST /api/team/upload — Upload a team member photo to Cloudinary (admin only)
// ---------------------------------------------------------------------------
exports.uploadPhoto = async (req, res) => {
  try {
    const file = req.file || (req.files && req.files[0]);

    if (!file) {
      return res.status(400).json({
        success: false,
        message: 'No photo image provided for upload',
      });
    }

    // Upload to Cloudinary under valluvam/team folder
    const result = await uploadStream(file.buffer, { folder: 'valluvam/team' });

    res.status(200).json({
      success: true,
      data: {
        url: result.secure_url,
        publicId: result.public_id,
      },
    });
  } catch (error) {
    console.error('Team photo upload error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error while uploading photo to Cloudinary',
    });
  }
};

// ---------------------------------------------------------------------------
// GET /api/team — Get team members
// Public endpoint. By default returns only active members sorted by displayOrder.
// If query ?all=true is passed, returns all members.
// ---------------------------------------------------------------------------
exports.getAllTeamMembers = async (req, res) => {
  try {
    const query = req.query.all === 'true' ? {} : { active: true };
    const members = await Team.find(query).sort({ displayOrder: 1, createdAt: 1 });

    res.status(200).json({
      success: true,
      count: members.length,
      data: members,
    });
  } catch (error) {
    console.error('Get team members error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching team members',
    });
  }
};

// ---------------------------------------------------------------------------
// GET /api/team/admin-list — Get all team members for admin panel (admin only)
// ---------------------------------------------------------------------------
exports.getAllTeamMembersAdmin = async (req, res) => {
  try {
    const members = await Team.find().sort({ displayOrder: 1, createdAt: 1 });

    res.status(200).json({
      success: true,
      count: members.length,
      data: members,
    });
  } catch (error) {
    console.error('Get admin team members error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching team members for admin',
    });
  }
};

// ---------------------------------------------------------------------------
// GET /api/team/:id — Get a single team member by ID
// ---------------------------------------------------------------------------
exports.getTeamMemberById = async (req, res) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid team member ID format',
      });
    }

    const member = await Team.findById(req.params.id);

    if (!member) {
      return res.status(404).json({
        success: false,
        message: 'Team member not found',
      });
    }

    res.status(200).json({
      success: true,
      data: member,
    });
  } catch (error) {
    console.error('Get team member by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching team member',
    });
  }
};

// ---------------------------------------------------------------------------
// POST /api/team — Create a new team member (admin only)
// ---------------------------------------------------------------------------
exports.createTeamMember = async (req, res) => {
  try {
    // If displayOrder is omitted or not a valid number, append to the end
    if (req.body.displayOrder === undefined || req.body.displayOrder === null || req.body.displayOrder === '') {
      const highest = await Team.findOne().sort({ displayOrder: -1 }).select('displayOrder');
      req.body.displayOrder = highest ? highest.displayOrder + 1 : 1;
    } else {
      req.body.displayOrder = Number(req.body.displayOrder) || 0;
    }

    const member = await Team.create(req.body);

    res.status(201).json({
      success: true,
      data: member,
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

    console.error('Create team member error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating team member',
    });
  }
};

// ---------------------------------------------------------------------------
// PUT /api/team/:id — Update an existing team member (admin only)
// ---------------------------------------------------------------------------
exports.updateTeamMember = async (req, res) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid team member ID format',
      });
    }

    const existingMember = await Team.findById(req.params.id);
    if (!existingMember) {
      return res.status(404).json({
        success: false,
        message: 'Team member not found',
      });
    }

    // If displayOrder is updated, ensure it's a number
    if (req.body.displayOrder !== undefined) {
      req.body.displayOrder = Number(req.body.displayOrder) || 0;
    }

    // If photo is changed or removed, clean up old Cloudinary asset
    if (
      req.body.photoPublicId !== undefined &&
      existingMember.photoPublicId &&
      existingMember.photoPublicId !== req.body.photoPublicId
    ) {
      deleteCloudinaryAsset(existingMember.photoPublicId);
    }

    const updatedMember = await Team.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      data: updatedMember,
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

    console.error('Update team member error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating team member',
    });
  }
};

// ---------------------------------------------------------------------------
// DELETE /api/team/:id — Delete a team member (admin only)
// ---------------------------------------------------------------------------
exports.deleteTeamMember = async (req, res) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid team member ID format',
      });
    }

    const member = await Team.findByIdAndDelete(req.params.id);

    if (!member) {
      return res.status(404).json({
        success: false,
        message: 'Team member not found',
      });
    }

    // Clean up associated Cloudinary photo if present
    if (member.photoPublicId) {
      deleteCloudinaryAsset(member.photoPublicId);
    }

    res.status(200).json({
      success: true,
      message: 'Team member deleted successfully',
    });
  } catch (error) {
    console.error('Delete team member error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting team member',
    });
  }
};
