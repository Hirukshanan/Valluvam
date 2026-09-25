const express = require('express');
const router = express.Router();
const { getSettings, updateSettings } = require('../controllers/settingsController');
const { protect, authorize } = require('../middleware/auth');

// ---------------------------------------------------------------------------
// Public endpoint — Retrieve current organization settings
// ---------------------------------------------------------------------------
router.get('/', getSettings);

// ---------------------------------------------------------------------------
// Admin-only endpoint — Update organization settings
// ---------------------------------------------------------------------------
router.put('/', protect, authorize('admin'), updateSettings);

module.exports = router;
