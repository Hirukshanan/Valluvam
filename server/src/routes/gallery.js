const express = require('express');
const router = express.Router();
const {
  getAllAlbums,
  getAlbumById,
  createAlbum,
  updateAlbum,
  deleteAlbum,
  uploadImages,
} = require('../controllers/galleryController');
const { protect, authorize } = require('../middleware/auth');
const multer = require('multer');
const upload = require('../middleware/upload');

// Middleware to catch and format multer errors cleanly as JSON
function uploadMiddleware(req, res, next) {
  upload.array('images', 30)(req, res, (err) => {
    if (err) {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({
            success: false,
            message: 'One or more image files exceed the 10 MB limit',
          });
        }
        if (err.code === 'LIMIT_FILE_COUNT') {
          return res.status(400).json({
            success: false,
            message: 'Maximum 30 images can be uploaded at once',
          });
        }
        return res.status(400).json({
          success: false,
          message: `Upload error: ${err.message}`,
        });
      }
      return res.status(400).json({
        success: false,
        message: err.message || 'Failed to process image upload',
      });
    }
    next();
  });
}

// Public endpoints
router.get('/', getAllAlbums);
router.get('/:id', getAlbumById);

// Admin-only endpoints
router.post('/upload', protect, authorize('admin'), uploadMiddleware, uploadImages);
router.post('/', protect, authorize('admin'), createAlbum);
router.put('/:id', protect, authorize('admin'), updateAlbum);
router.delete('/:id', protect, authorize('admin'), deleteAlbum);

module.exports = router;
