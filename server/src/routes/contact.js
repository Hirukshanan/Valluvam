const express = require('express');
const router = express.Router();
const { createContact } = require('../controllers/contactController');

// ---------------------------------------------------------------------------
// Public endpoint for submitting contact messages
// ---------------------------------------------------------------------------
router.post('/', createContact);

module.exports = router;
