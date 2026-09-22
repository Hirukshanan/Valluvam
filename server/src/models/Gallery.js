const mongoose = require('mongoose');

// ---------------------------------------------------------------------------
// Photo sub-schema — each photo inside a gallery album
// ---------------------------------------------------------------------------
// Designed so Cloudinary fields (publicId, etc.) can be added later
// without restructuring.
const photoSchema = new mongoose.Schema(
  {
    imageUrl: {
      type: String,
      required: [true, 'Photo image URL is required'],
      trim: true,
    },
    // Reserved for future Cloudinary integration
    publicId: {
      type: String,
      default: '',
      trim: true,
    },
    order: {
      type: Number,
      default: 0,
    },
  },
  {
    _id: true, // each photo gets its own _id for individual operations
  }
);

// ---------------------------------------------------------------------------
// Gallery Album schema
// ---------------------------------------------------------------------------
const gallerySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Album title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    description: {
      type: String,
      default: '',
      trim: true,
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: {
        values: [
          'Educational Support',
          'Rural Education',
          'Community Relief',
          'Events',
          'Other',
        ],
        message: '{VALUE} is not a valid category',
      },
    },
    date: {
      type: Date,
      required: [true, 'Album date is required'],
    },
    coverImage: {
      type: String,
      required: [true, 'Cover image URL is required'],
      trim: true,
    },
    // Reserved for future Cloudinary integration
    coverImagePublicId: {
      type: String,
      default: '',
      trim: true,
    },
    photos: {
      type: [photoSchema],
      default: [],
      validate: {
        validator: function (arr) {
          return arr.length <= 100;
        },
        message: 'A gallery album cannot contain more than 100 photos',
      },
    },
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
      default: null,
    },
  },
  {
    timestamps: true, // adds createdAt and updatedAt automatically
  }
);

module.exports = mongoose.model('Gallery', gallerySchema);

