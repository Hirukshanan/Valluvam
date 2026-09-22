const express = require('express');
const router = express.Router();
const {
  getAllAlbums,
  getAlbumById,
  createAlbum,
  updateAlbum,
  deleteAlbum,
} = require('../controllers/galleryController');
const { protect, authorize } = require('../middleware/auth');

// Public endpoints
router.get('/', getAllAlbums);
router.get('/:id', getAlbumById);

// Admin-only endpoints
router.post('/', protect, authorize('admin'), createAlbum);
router.put('/:id', protect, authorize('admin'), updateAlbum);
router.delete('/:id', protect, authorize('admin'), deleteAlbum);

module.exports = router;

