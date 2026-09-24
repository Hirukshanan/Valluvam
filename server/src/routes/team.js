const express = require('express');
const router = express.Router();
const {
  getAllTeamMembers,
  getAllTeamMembersAdmin,
  getTeamMemberById,
  createTeamMember,
  updateTeamMember,
  deleteTeamMember,
  uploadPhoto,
} = require('../controllers/teamController');
const { protect, authorize } = require('../middleware/auth');
const multer = require('multer');
const upload = require('../middleware/upload');

// Middleware to catch and format multer errors cleanly as JSON
function uploadMiddleware(req, res, next) {
  upload.single('photo')(req, res, (err) => {
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

// ---------------------------------------------------------------------------
// Public endpoints
// ---------------------------------------------------------------------------
router.get('/', getAllTeamMembers);

// ---------------------------------------------------------------------------
// Admin-only endpoints (must be defined before /:id to avoid route collision)
// ---------------------------------------------------------------------------
router.get('/admin-list', protect, authorize('admin'), getAllTeamMembersAdmin);
router.post('/upload', protect, authorize('admin'), uploadMiddleware, uploadPhoto);
router.post('/', protect, authorize('admin'), createTeamMember);
router.put('/:id', protect, authorize('admin'), updateTeamMember);
router.delete('/:id', protect, authorize('admin'), deleteTeamMember);

// Single member endpoint
router.get('/:id', getTeamMemberById);

module.exports = router;
