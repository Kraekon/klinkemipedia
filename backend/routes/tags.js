const express = require('express');
const router = express.Router();
const Article = require('../models/Article');

// @desc    Get all tags with article counts
// @route   GET /api/tags
// @access  Public
router.get('/', async (req, res) => {
  try {
    // Aggregate tags with counts
    const tagCounts = await Article.aggregate([
      { $match: { status: 'published' } },
      { $unwind: '$tags' },
      { $group: { _id: '$tags', count: { $sum: 1 } } },
      { $sort: { count: -1, _id: 1 } },
      { $project: { tag: '$_id', count: 1, _id: 0 } }
    ]);

    res.json({
      success: true,
      data: tagCounts
    });
  } catch (error) {
    console.error('Error fetching tags:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @desc    Create a new tag (admin only)
// @route   POST /api/tags
// @access  Admin
router.post('/', async (req, res) => {
  try {
    const { tagName } = req.body;

    if (!tagName || typeof tagName !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Tag name is required'
      });
    }

    const normalizedTag = tagName.toLowerCase().trim();

    if (normalizedTag.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Tag name cannot be empty'
      });
    }

    // Check if tag already exists
    const existingTag = await Article.findOne({
      tags: normalizedTag,
      status: 'published'
    });

    if (existingTag) {
      return res.status(400).json({
        success: false,
        message: 'Tag already exists'
      });
    }

    // Create a placeholder article with this tag to make it appear in the system
    // Note: This is a workaround. Ideally you'd have a separate Tags collection
    // For now, we'll just return success and the tag will be created when added to an article
    res.json({
      success: true,
      message: `Tag "${normalizedTag}" is ready to use`,
      data: {
        tag: normalizedTag,
        count: 0
      }
    });
  } catch (error) {
    console.error('Error creating tag:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @desc    Get articles by tag
// @route   GET /api/tags/:tag/articles
// @access  Public
router.get('/:tag/articles', async (req, res) => {
  try {
    const tag = req.params.tag.toLowerCase().trim();
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Find articles with this tag
    const articles = await Article.find({
      tags: tag,
      status: 'published'
    })
      .select('title slug summary category tags views createdAt updatedAt')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    // Get total count
    const total = await Article.countDocuments({
      tags: tag,
      status: 'published'
    });

    res.json({
      success: true,
      data: articles,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching articles by tag:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @desc    Merge tags (admin only)
// @route   PUT /api/tags/merge
// @access  Admin
router.put('/merge', async (req, res) => {
  try {
    const { sourceTags, targetTag } = req.body;

    if (!sourceTags || !Array.isArray(sourceTags) || sourceTags.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Source tags array is required'
      });
    }

    if (!targetTag || typeof targetTag !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Target tag is required'
      });
    }

    const normalizedTargetTag = targetTag.toLowerCase().trim();
    const normalizedSourceTags = sourceTags.map(tag => tag.toLowerCase().trim());

    // Find all articles with source tags
    const articles = await Article.find({
      tags: { $in: normalizedSourceTags }
    });

    let updatedCount = 0;
    for (const article of articles) {
      const newTags = new Set();
      
      // Add all existing tags except source tags
      article.tags.forEach(tag => {
        if (!normalizedSourceTags.includes(tag)) {
          newTags.add(tag);
        }
      });
      
      // Add target tag
      newTags.add(normalizedTargetTag);
      
      article.tags = Array.from(newTags);
      await article.save();
      updatedCount++;
    }

    res.json({
      success: true,
      message: `Merged ${normalizedSourceTags.length} tags into "${normalizedTargetTag}"`,
      updatedArticles: updatedCount
    });
  } catch (error) {
    console.error('Error merging tags:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @desc    Delete tag from all articles (admin only)
// @route   DELETE /api/tags/:tag
// @access  Admin
router.delete('/:tag', async (req, res) => {
  try {
    const tag = req.params.tag.toLowerCase().trim();

    // Remove tag from all articles
    const result = await Article.updateMany(
      { tags: tag },
      { $pull: { tags: tag } }
    );

    res.json({
      success: true,
      message: `Tag "${tag}" removed from ${result.modifiedCount} articles`,
      modifiedCount: result.modifiedCount
    });
  } catch (error) {
    console.error('Error deleting tag:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;