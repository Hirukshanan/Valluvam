const mongoose = require('mongoose');
const Gallery = require('../models/Gallery');
const { uploadStream, deleteCloudinaryAsset } = require('../config/cloudinary');

// ---------------------------------------------------------------------------
// Helper — check if a string is a valid MongoDB ObjectId
// ---------------------------------------------------------------------------
function isValidId(id) {
  return mongoose.Types.ObjectId.isValid(id);
}

// ---------------------------------------------------------------------------
// POST /api/gallery/upload — Upload images to Cloudinary (admin only)
// ---------------------------------------------------------------------------
exports.uploadImages = async (req, res) => {
  try {
    const files = req.files || (req.file ? [req.file] : []);

    if (!files || files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No image files provided for upload',
      });
    }

    // Upload all files to Cloudinary using uploadStream
    const uploadPromises = files.map(async (file) => {
      const result = await uploadStream(file.buffer);
      return {
        url: result.secure_url,
        publicId: result.public_id,
      };
    });

    const uploaded = await Promise.all(uploadPromises);

    res.status(200).json({
      success: true,
      count: uploaded.length,
      data: uploaded,
    });
  } catch (error) {
    console.error('Gallery image upload error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error while uploading images to Cloudinary',
    });
  }
};

// ---------------------------------------------------------------------------
// GET /api/gallery — List all gallery albums (public)
// ---------------------------------------------------------------------------
exports.getAllAlbums = async (req, res) => {
  try {
    const albums = await Gallery.find().sort({ date: -1 });

    res.status(200).json({
      success: true,
      count: albums.length,
      data: albums,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error while fetching gallery albums',
    });
  }
};

// ---------------------------------------------------------------------------
// GET /api/gallery/:id — Get a single gallery album (public)
// ---------------------------------------------------------------------------
exports.getAlbumById = async (req, res) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid gallery album ID format',
      });
    }

    const album = await Gallery.findById(req.params.id);

    if (!album) {
      return res.status(404).json({
        success: false,
        message: 'Gallery album not found',
      });
    }

    res.status(200).json({
      success: true,
      data: album,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error while fetching gallery album',
    });
  }
};

// ---------------------------------------------------------------------------
// POST /api/gallery — Create a new gallery album (admin only)
// ---------------------------------------------------------------------------
exports.createAlbum = async (req, res) => {
  try {
    // Sort photos by order if provided
    if (req.body.photos && Array.isArray(req.body.photos)) {
      req.body.photos = req.body.photos.map((photo, index) => ({
        ...photo,
        order: photo.order !== undefined ? photo.order : index,
      }));
    }

    // Validate eventId if provided
    if (req.body.eventId && !isValidId(req.body.eventId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid event ID format',
      });
    }

    const album = await Gallery.create(req.body);

    res.status(201).json({
      success: true,
      data: album,
    });
  } catch (error) {
    // Mongoose validation error
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((err) => err.message);

      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: messages,
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error while creating gallery album',
    });
  }
};

// ---------------------------------------------------------------------------
// PUT /api/gallery/:id — Update an existing gallery album (admin only)
// ---------------------------------------------------------------------------
exports.updateAlbum = async (req, res) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid gallery album ID format',
      });
    }

    // Validate eventId if provided
    if (req.body.eventId && !isValidId(req.body.eventId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid event ID format',
      });
    }

    // If photos are being updated, identify removed photos with publicId and clean them from Cloudinary
    if (req.body.photos && Array.isArray(req.body.photos)) {
      const existingAlbum = await Gallery.findById(req.params.id);
      if (existingAlbum && existingAlbum.photos && existingAlbum.photos.length > 0) {
        const incomingPublicIds = new Set(
          req.body.photos.map((p) => p.publicId).filter(Boolean)
        );
        const removedPhotos = existingAlbum.photos.filter(
          (p) => p.publicId && !incomingPublicIds.has(p.publicId)
        );
        for (const photo of removedPhotos) {
          deleteCloudinaryAsset(photo.publicId);
        }
      }
    }

    // Sort photos by order if provided
    if (req.body.photos && Array.isArray(req.body.photos)) {
      req.body.photos = req.body.photos.map((photo, index) => ({
        ...photo,
        order: photo.order !== undefined ? photo.order : index,
      }));
    }

    const album = await Gallery.findByIdAndUpdate(req.params.id, req.body, {
      new: true,            // return the updated document
      runValidators: true,  // apply schema validators on update
    });

    if (!album) {
      return res.status(404).json({
        success: false,
        message: 'Gallery album not found',
      });
    }

    res.status(200).json({
      success: true,
      data: album,
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

    res.status(500).json({
      success: false,
      message: 'Server error while updating gallery album',
    });
  }
};

// ---------------------------------------------------------------------------
// DELETE /api/gallery/:id — Delete a gallery album (admin only)
// ---------------------------------------------------------------------------
exports.deleteAlbum = async (req, res) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid gallery album ID format',
      });
    }

    const album = await Gallery.findByIdAndDelete(req.params.id);

    if (!album) {
      return res.status(404).json({
        success: false,
        message: 'Gallery album not found',
      });
    }

    // Clean up all Cloudinary assets associated with this album
    if (album.photos && album.photos.length > 0) {
      for (const photo of album.photos) {
        if (photo.publicId) {
          deleteCloudinaryAsset(photo.publicId);
        }
      }
    }
    if (album.coverImagePublicId) {
      deleteCloudinaryAsset(album.coverImagePublicId);
    }

    res.status(200).json({
      success: true,
      message: 'Gallery album deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error while deleting gallery album',
    });
  }
};
