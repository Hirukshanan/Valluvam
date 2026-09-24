const express = require('express');
const router = express.Router();
const {
  createContact,
  getAllContacts,
  getContactById,
  updateContact,
  deleteContact,
} = require('../controllers/contactController');
const { protect, authorize } = require('../middleware/auth');
const { contactRateLimiter } = require('../middleware/rateLimiter');

// ---------------------------------------------------------------------------
// Public endpoint for submitting contact messages (rate-limited)
// ---------------------------------------------------------------------------
router.post('/', contactRateLimiter, createContact);

// ---------------------------------------------------------------------------
// Admin-only endpoints — JWT authentication and admin authorization required
// ---------------------------------------------------------------------------
router.get('/', protect, authorize('admin'), getAllContacts);
router.get('/:id', protect, authorize('admin'), getContactById);
router.put('/:id', protect, authorize('admin'), updateContact);
router.delete('/:id', protect, authorize('admin'), deleteContact);

module.exports = router;
