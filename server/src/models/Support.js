const mongoose = require('mongoose');

// ---------------------------------------------------------------------------
// Verified Default Support Options
// Used for initial seeding if no support options exist in the database
// ---------------------------------------------------------------------------
const DEFAULT_SUPPORT_OPTIONS = [
  {
    title: 'Support a Student',
    description:
      'Help a student in need by contributing towards essentials such as school supplies, learning materials, or transport, so they can focus on their education.',
    displayOrder: 1,
    active: true,
    icon: 'student',
  },
  {
    title: 'Educational Materials',
    description:
      'Support the provision of books, past papers, stationery, and other resources that help students and learners access quality education.',
    displayOrder: 2,
    active: true,
    icon: 'materials',
  },
  {
    title: 'Sponsor an Initiative',
    description:
      'Partner with Valluvam to sponsor a specific programme or community initiative, helping us plan and deliver more impactful activities.',
    displayOrder: 3,
    active: true,
    icon: 'sponsor',
  },
  {
    title: 'Volunteer Your Time',
    description:
      'Share your skills, knowledge, or energy by volunteering with Valluvam. Every hour of your time contributes to a stronger community.',
    displayOrder: 4,
    active: true,
    icon: 'volunteer',
  },
  {
    title: 'Community Relief',
    description:
      'Contribute to relief efforts that support families and communities during difficult periods, including the provision of food and essential supplies.',
    displayOrder: 5,
    active: true,
    icon: 'relief',
  },
];

const supportSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Support option title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    description: {
      type: String,
      required: [true, 'Support option description is required'],
      trim: true,
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
    },
    displayOrder: {
      type: Number,
      default: 0,
    },
    active: {
      type: Boolean,
      default: true,
    },
    icon: {
      type: String,
      default: 'heart',
      trim: true,
    },
  },
  {
    timestamps: true, // creates createdAt and updatedAt automatically
  }
);

// Index for efficient sorting by displayOrder and createdAt
supportSchema.index({ displayOrder: 1, createdAt: 1 });

module.exports = {
  Support: mongoose.model('Support', supportSchema),
  DEFAULT_SUPPORT_OPTIONS,
};
