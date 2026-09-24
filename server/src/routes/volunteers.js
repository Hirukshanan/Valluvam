const express = require('express');
const router = express.Router();
const { createVolunteer } = require('../controllers/volunteerController');

// ---------------------------------------------------------------------------
// Public endpoint for submitting volunteer interest
// ---------------------------------------------------------------------------
router.post('/', createVolunteer);

module.exports = router;
