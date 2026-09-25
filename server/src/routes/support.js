const express = require('express');
const router = express.Router();
const {
  getAllSupport,
  getSupportById,
  createSupport,
  updateSupport,
  deleteSupport,
} = require('../controllers/supportController');
const { protect, authorize } = require('../middleware/auth');

// ---------------------------------------------------------------------------
// Public endpoints
// ---------------------------------------------------------------------------
router.get('/', getAllSupport);

// ---------------------------------------------------------------------------
// Admin-only endpoints — JWT authentication and admin authorization required
// ---------------------------------------------------------------------------
router.post('/', protect, authorize('admin'), createSupport);
router.put('/:id', protect, authorize('admin'), updateSupport);
router.delete('/:id', protect, authorize('admin'), deleteSupport);

// Single support option (after specific endpoints)
router.get('/:id', getSupportById);

module.exports = router;
