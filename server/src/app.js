const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const mongoose = require('mongoose');

const app = express();

// Trust the first reverse proxy (Cloudflare, Render, Railway, Nginx, etc.)
// Ensures accurate client IP identification for express-rate-limit and Turnstile
app.set('trust proxy', 1);

// ---------------------------------------------------------------------------
// Security Middleware & HTTP Headers
// ---------------------------------------------------------------------------
app.use(
  helmet({
    // Allow CORS-enabled cross-origin clients (e.g. React frontend) to access resources
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", 'https://challenges.cloudflare.com'],
        frameSrc: ["'self'", 'https://challenges.cloudflare.com'],
        imgSrc: ["'self'", 'data:', 'https://res.cloudinary.com', 'blob:'],
        connectSrc: [
          "'self'",
          'https://challenges.cloudflare.com',
          'https://api.cloudinary.com',
        ],
        styleSrc: ["'self'", "'unsafe-inline'"],
        fontSrc: ["'self'", 'data:'],
        objectSrc: ["'none'"],
        baseUri: ["'self'"],
        formAction: ["'self'"],
        upgradeInsecureRequests: process.env.NODE_ENV === 'production' ? [] : null,
      },
    },
  })
);

// ---------------------------------------------------------------------------
// Middleware
// ---------------------------------------------------------------------------
const allowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  process.env.CLIENT_URL,
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, or server-to-server)
      if (!origin) return callback(null, true);
      if (
        allowedOrigins.indexOf(origin) !== -1 ||
        /^http:\/\/localhost:\d+$/.test(origin) ||
        /^http:\/\/127\.0\.0\.1:\d+$/.test(origin)
      ) {
        return callback(null, true);
      }
      return callback(null, true);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  })
);
app.use(express.json());

// ---------------------------------------------------------------------------
// Routes
// ---------------------------------------------------------------------------

// Health check — confirms API availability and MongoDB connection state
app.get('/api/health', (req, res) => {
  const isConnected = mongoose.connection.readyState === 1;

  const dbStateMap = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting',
  };

  const dbStatus = dbStateMap[mongoose.connection.readyState] || 'unavailable';
  const statusCode = isConnected ? 200 : 503;

  res.status(statusCode).json({
    success: isConnected,
    status: isConnected ? 'healthy' : 'degraded',
    database: dbStatus,
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString(),
  });
});

// Feature routes
app.use('/api/events', require('./routes/events'));
app.use('/api/auth', require('./routes/auth'));

app.use('/api/gallery', require('./routes/gallery'));
app.use('/api/team', require('./routes/team'));
app.use('/api/teams', require('./routes/team'));

app.use('/api/volunteers', require('./routes/volunteers'));
app.use('/api/volunteer', require('./routes/volunteers'));

app.use('/api/contact', require('./routes/contact'));
app.use('/api/contacts', require('./routes/contact'));

app.use('/api/settings', require('./routes/settings'));

app.use('/api/support', require('./routes/support'));

app.use('/api/admin', require('./routes/admin'));

// ---------------------------------------------------------------------------
// Error Handling Middleware
// ---------------------------------------------------------------------------
const { notFoundHandler, errorHandler } = require('./middleware/errorHandler');

// 404 Catch-All for undefined routes — ensures standard JSON response
app.use(notFoundHandler);

// Central Error Handler — guarantees all errors return standard JSON with CORS headers
app.use(errorHandler);

module.exports = app;

