const express = require('express');
const cors = require('cors');

const app = express();

// ---------------------------------------------------------------------------
// Middleware
// ---------------------------------------------------------------------------
app.use(cors());
app.use(express.json());

// ---------------------------------------------------------------------------
// Routes
// ---------------------------------------------------------------------------

// Health check — confirms the API is running.
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Valluvam API is running',
  });
});

// Future route files will be registered here:
// app.use('/api/events',    require('./routes/events'));
// app.use('/api/gallery',   require('./routes/gallery'));
// app.use('/api/contact',   require('./routes/contact'));
// app.use('/api/volunteer', require('./routes/volunteer'));

module.exports = app;

