const express = require('express');
const router = express.Router();
const { getDashboardStats } = require('../controllers/adminDashboardController');
const { protect, authorize } = require('../middleware/auth');

// ---------------------------------------------------------------------------
// Protected admin dashboard endpoints
// Requires authenticated admin access (JWT + admin role)
// ---------------------------------------------------------------------------
router.get('/dashboard/stats', protect, authorize('admin'), getDashboardStats);

module.exports = router;
