const mongoose = require('mongoose');
const { Support, DEFAULT_SUPPORT_OPTIONS } = require('../models/Support');

// ---------------------------------------------------------------------------
// Helper — check if a string is a valid MongoDB ObjectId
// ---------------------------------------------------------------------------
function isValidId(id) {
  return mongoose.Types.ObjectId.isValid(id);
}

// ---------------------------------------------------------------------------
// GET /api/support — List support options
// Public endpoint. By default returns only active options sorted by displayOrder.
// If query ?all=true is passed (admin panel), returns all options.
// Auto-seeds default options if the collection is empty.
// ---------------------------------------------------------------------------
exports.getAllSupport = async (req, res) => {
  try {
    const totalCount = await Support.countDocuments();
    if (totalCount === 0) {
      await Support.insertMany(DEFAULT_SUPPORT_OPTIONS);
    }

    const query = req.query.all === 'true' ? {} : { active: true };
    const options = await Support.find(query).sort({ displayOrder: 1, createdAt: 1 });

    res.status(200).json({
      success: true,
      count: options.length,
      data: options,
    });
  } catch (error) {
    console.error('Error fetching support options:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching support options',
    });
  }
};

// ---------------------------------------------------------------------------
// GET /api/support/:id — Get a single support option by ID
// ---------------------------------------------------------------------------
exports.getSupportById = async (req, res) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid support option ID format',
      });
    }

    const option = await Support.findById(req.params.id);

    if (!option) {
      return res.status(404).json({
        success: false,
        message: 'Support option not found',
      });
    }

    res.status(200).json({
      success: true,
      data: option,
    });
  } catch (error) {
    console.error('Error fetching support option:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching support option',
    });
  }
};

// ---------------------------------------------------------------------------
// POST /api/support — Create a new support option (admin only)
// ---------------------------------------------------------------------------
exports.createSupport = async (req, res) => {
  try {
    const { title, description, displayOrder, active, icon } = req.body;

    if (!title || typeof title !== 'string' || !title.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Title is required',
      });
    }

    if (!description || typeof description !== 'string' || !description.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Description is required',
      });
    }

    const payload = {
      title: title.trim(),
      description: description.trim(),
      displayOrder: displayOrder !== undefined ? Number(displayOrder) || 0 : 0,
      active: active !== undefined ? Boolean(active) : true,
      icon: typeof icon === 'string' && icon.trim() ? icon.trim() : 'heart',
    };

    const newOption = await Support.create(payload);

    res.status(201).json({
      success: true,
      message: 'Support option created successfully',
      data: newOption,
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

    console.error('Create support option error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating support option',
    });
  }
};

// ---------------------------------------------------------------------------
// PUT /api/support/:id — Update an existing support option (admin only)
// ---------------------------------------------------------------------------
exports.updateSupport = async (req, res) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid support option ID format',
      });
    }

    const existing = await Support.findById(req.params.id);
    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Support option not found',
      });
    }

    const updates = {};
    if (req.body.title !== undefined) updates.title = req.body.title.trim();
    if (req.body.description !== undefined) updates.description = req.body.description.trim();
    if (req.body.displayOrder !== undefined) updates.displayOrder = Number(req.body.displayOrder) || 0;
    if (req.body.active !== undefined) updates.active = Boolean(req.body.active);
    if (req.body.icon !== undefined) updates.icon = req.body.icon.trim() || 'heart';

    const updatedOption = await Support.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      message: 'Support option updated successfully',
      data: updatedOption,
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

    console.error('Update support option error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating support option',
    });
  }
};

// ---------------------------------------------------------------------------
// DELETE /api/support/:id — Delete a support option (admin only)
// ---------------------------------------------------------------------------
exports.deleteSupport = async (req, res) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid support option ID format',
      });
    }

    const option = await Support.findByIdAndDelete(req.params.id);

    if (!option) {
      return res.status(404).json({
        success: false,
        message: 'Support option not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Support option deleted successfully',
    });
  } catch (error) {
    console.error('Delete support option error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting support option',
    });
  }
};
