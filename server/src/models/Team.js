const mongoose = require('mongoose');

// ---------------------------------------------------------------------------
// Team Member Schema
// ---------------------------------------------------------------------------
const teamSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      default: '',
      trim: true,
      maxlength: [150, 'Name cannot exceed 150 characters'],
    },
    role: {
      type: String,
      required: [true, 'Role is required'],
      trim: true,
      maxlength: [150, 'Role cannot exceed 150 characters'],
    },
    photo: {
      type: String,
      default: '',
      trim: true,
    },
    photoPublicId: {
      type: String,
      default: '',
      trim: true,
    },
    bio: {
      type: String,
      default: '',
      trim: true,
      maxlength: [2000, 'Bio cannot exceed 2000 characters'],
    },
    displayOrder: {
      type: Number,
      default: 0,
    },
    active: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true, // adds createdAt and updatedAt automatically
  }
);

// Index for efficient sorting by displayOrder
teamSchema.index({ displayOrder: 1, createdAt: 1 });

module.exports = mongoose.model('Team', teamSchema);
