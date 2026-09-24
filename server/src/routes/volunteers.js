const express = require('express');
const router = express.Router();
const {
  createVolunteer,
  getAllVolunteers,
  getVolunteerById,
  updateVolunteer,
  deleteVolunteer,
} = require('../controllers/volunteerController');
const { protect, authorize } = require('../middleware/auth');
const { volunteerRateLimiter } = require('../middleware/rateLimiter');

// ---------------------------------------------------------------------------
// Public endpoint — Website visitors submit volunteer interest (rate-limited)
// ---------------------------------------------------------------------------
router.post('/', volunteerRateLimiter, createVolunteer);

// ---------------------------------------------------------------------------
// Admin-only endpoints — JWT authentication and admin authorization required
// ---------------------------------------------------------------------------
router.get('/', protect, authorize('admin'), getAllVolunteers);
router.get('/:id', protect, authorize('admin'), getVolunteerById);
router.put('/:id', protect, authorize('admin'), updateVolunteer);
router.delete('/:id', protect, authorize('admin'), deleteVolunteer);

module.exports = router;
