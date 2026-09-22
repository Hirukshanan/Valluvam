const mongoose = require('mongoose');
const Event = require('../models/Event');

// ---------------------------------------------------------------------------
// Helper — check if a string is a valid MongoDB ObjectId
// ---------------------------------------------------------------------------
function isValidId(id) {
  return mongoose.Types.ObjectId.isValid(id);
}

// ---------------------------------------------------------------------------
// GET /api/events — List all events
// ---------------------------------------------------------------------------
exports.getAllEvents = async (req, res) => {
  try {
    const events = await Event.find({ status: 'published' }).sort({ date: -1 });

    res.status(200).json({
      success: true,
      count: events.length,
      data: events,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error while fetching events',
    });
  }
};

// ---------------------------------------------------------------------------
// GET /api/events/:id — Get a single event
// ---------------------------------------------------------------------------
exports.getEventById = async (req, res) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid event ID format',
      });
    }

    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found',
      });
    }

    res.status(200).json({
      success: true,
      data: event,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error while fetching event',
    });
  }
};

// ---------------------------------------------------------------------------
// POST /api/events — Create a new event
// ---------------------------------------------------------------------------
exports.createEvent = async (req, res) => {
  try {
    const event = await Event.create(req.body);

    res.status(201).json({
      success: true,
      data: event,
    });
  } catch (error) {
    // Mongoose validation error
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((err) => err.message);

      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: messages,
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error while creating event',
    });
  }
};

// ---------------------------------------------------------------------------
// PUT /api/events/:id — Update an existing event
// ---------------------------------------------------------------------------
exports.updateEvent = async (req, res) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid event ID format',
      });
    }

    const event = await Event.findByIdAndUpdate(req.params.id, req.body, {
      new: true,            // return the updated document
      runValidators: true,  // apply schema validators on update
    });

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found',
      });
    }

    res.status(200).json({
      success: true,
      data: event,
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((err) => err.message);

      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: messages,
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error while updating event',
    });
  }
};

// ---------------------------------------------------------------------------
// DELETE /api/events/:id — Delete an event
// ---------------------------------------------------------------------------
exports.deleteEvent = async (req, res) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid event ID format',
      });
    }

    const event = await Event.findByIdAndDelete(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Event deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error while deleting event',
    });
  }
};

// ---------------------------------------------------------------------------
// GET /api/events/admin — List all events (admin only, includes drafts)
// ---------------------------------------------------------------------------
exports.getAllEventsAdmin = async (req, res) => {
  try {
    const events = await Event.find().sort({ date: -1 });

    res.status(200).json({
      success: true,
      count: events.length,
      data: events,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error while fetching events',
    });
  }
};

