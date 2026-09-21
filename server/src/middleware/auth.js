const jwt = require('jsonwebtoken');
const User = require('../models/User');

// ---------------------------------------------------------------------------
// protect — verify JWT and attach user to req.user
// ---------------------------------------------------------------------------
exports.protect = async (req, res, next) => {
  try {
    let token;

    // Extract token from Authorization header
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized — no token provided',
      });
    }

    // Verify the token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized — invalid token',
      });
    }

    // Confirm the user still exists in the database
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized — user no longer exists',
      });
    }

    // Attach user info to the request for downstream handlers
    req.user = { id: user._id, role: user.role };
    next();
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error during authentication',
    });
  }
};

// ---------------------------------------------------------------------------
// authorize — restrict access to specific roles
// Usage: authorize('admin')
// ---------------------------------------------------------------------------
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden — insufficient permissions',
      });
    }
    next();
  };
};

