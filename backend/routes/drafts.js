const express = require('express');
const router = express.Router();
const Draft = require('../models/Draft');
const { protect } = require('../middleware/auth');

// Get all drafts for current user
router.get('/', protect, async (req, res) => {
  try {
    const drafts = await Draft.find({ user: req.user._id })
      .sort({ updatedAt: -1 })
      .populate('article', 'title slug');
    
    res.json({
      success: true,
      count: drafts.length,
      data: drafts
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching drafts',
      error: error.message
    });
  }
});

// Get specific draft
router.get('/:id', protect, async (req, res) => {
  try {
    const draft = await Draft.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!draft) {
      return res.status(404).json({
        success: false,
        message: 'Draft not found'
      });
    }

    res.json({
      success: true,
      data: draft
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching draft',
      error: error.message
    });
  }
});

// Save/create draft
router.post('/', protect, async (req, res) => {
  try {
    const { title, content, contentType, tags, category, metadata, article } = req.body;

    // Check if draft already exists for this article
    let draft;
    if (article) {
      draft = await Draft.findOne({ user: req.user._id, article });
    }

    if (draft) {
      // Update existing draft
      draft.title = title;
      draft.content = content;
      draft.contentType = contentType || 'html';
      draft.tags = tags;
      draft.category = category;
      draft.metadata = metadata;
      draft.lastSavedAt = Date.now();
      await draft.save();
    } else {
      // Create new draft
      draft = await Draft.create({
        user: req.user._id,
        article,
        title,
        content,
        contentType: contentType || 'html',
        tags,
        category,
        metadata,
        lastSavedAt: Date.now()
      });
    }

    res.json({
      success: true,
      data: draft,
      message: 'Draft saved successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error saving draft',
      error: error.message
    });
  }
});

// Update draft
router.put('/:id', protect, async (req, res) => {
  try {
    const draft = await Draft.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!draft) {
      return res.status(404).json({
        success: false,
        message: 'Draft not found'
      });
    }

    const { title, content, contentType, tags, category, metadata } = req.body;
    
    if (title) draft.title = title;
    if (content) draft.content = content;
    if (contentType) draft.contentType = contentType;
    if (tags) draft.tags = tags;
    if (category) draft.category = category;
    if (metadata) draft.metadata = metadata;
    draft.lastSavedAt = Date.now();

    await draft.save();

    res.json({
      success: true,
      data: draft,
      message: 'Draft updated successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating draft',
      error: error.message
    });
  }
});

// Delete draft
router.delete('/:id', protect, async (req, res) => {
  try {
    const draft = await Draft.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!draft) {
      return res.status(404).json({
        success: false,
        message: 'Draft not found'
      });
    }

    await draft.deleteOne();

    res.json({
      success: true,
      message: 'Draft deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting draft',
      error: error.message
    });
  }
});

module.exports = router;
