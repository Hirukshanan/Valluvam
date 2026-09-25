const express = require('express');
const router = express.Router();
const {
  getAllEvents,
  getAllEventsAdmin,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
  uploadEventImage,
} = require('../controllers/eventController');
const { protect, authorize } = require('../middleware/auth');
const multer = require('multer');
const upload = require('../middleware/upload');

// Middleware to catch and format multer errors cleanly as JSON
function uploadMiddleware(req, res, next) {
  upload.single('image')(req, res, (err) => {
    if (err) {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({
            success: false,
            message: 'Image file exceeds the 10 MB limit',
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
router.get('/', getAllEvents);

// Admin-only endpoints (must be before /:id to avoid conflict)
router.get('/admin-list', protect, authorize('admin'), getAllEventsAdmin);
router.post('/upload', protect, authorize('admin'), uploadMiddleware, uploadEventImage);
router.post('/', protect, authorize('admin'), createEvent);
router.put('/:id', protect, authorize('admin'), updateEvent);
router.delete('/:id', protect, authorize('admin'), deleteEvent);

// Public single event (after specific routes)
router.get('/:id', getEventById);

module.exports = router;
