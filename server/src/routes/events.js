const express = require('express');
const router = express.Router();
const {
  getAllEvents,
  getAllEventsAdmin,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
} = require('../controllers/eventController');
const { protect, authorize } = require('../middleware/auth');

// Public endpoints
router.get('/', getAllEvents);

// Admin-only endpoints (must be before /:id to avoid conflict)
router.get('/admin-list', protect, authorize('admin'), getAllEventsAdmin);
router.post('/', protect, authorize('admin'), createEvent);
router.put('/:id', protect, authorize('admin'), updateEvent);
router.delete('/:id', protect, authorize('admin'), deleteEvent);

// Public single event (after specific routes)
router.get('/:id', getEventById);

module.exports = router;
