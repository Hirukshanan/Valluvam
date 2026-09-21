const express = require('express');
const router = express.Router();
const { login, getMe } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

// Public
router.post('/login', login);

// Protected
router.get('/me', protect, getMe);

module.exports = router;

