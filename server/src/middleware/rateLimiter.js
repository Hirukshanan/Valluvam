const { rateLimit } = require('express-rate-limit');

/**
 * Rate limiter for public contact submissions.
 * Limits each IP address to 5 submissions per 15 minutes.
 */
const contactRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 5, // Limit each IP to 5 requests per windowMs
  standardHeaders: true, // Return standard `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      message: 'Too many contact requests from this IP. Please try again after 15 minutes.',
    });
  },
});

/**
 * Rate limiter for public volunteer submissions.
 * Limits each IP address to 5 submissions per 15 minutes.
 */
const volunteerRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 5, // Limit each IP to 5 requests per windowMs
  standardHeaders: true, // Return standard `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      message: 'Too many volunteer applications submitted from this IP. Please try again after 15 minutes.',
    });
  },
});

module.exports = {
  contactRateLimiter,
  volunteerRateLimiter,
};
