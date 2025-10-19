const express = require('express');
const router = express.Router();
const Media = require('../models/Media');
const Article = require('../models/Article');
const imageStorage = require('../utils/imageStorage');
const path = require('path');

// GET /api/media - List all uploaded images with metadata
router.get('/', async (req, res) => {
  try {
    // Parse query parameters
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const sort = req.query.sort || 'date';
    const order = req.query.order || 'desc';
    const filter = req.query.filter || 'all';
    
    const skip = (page - 1) * limit;

    // Build query
    let query = {};
    if (filter === 'used') {
      query.usageCount = { $gt: 0 };
    } else if (filter === 'unused') {
      query.usageCount = 0;
    }

    // Build sort object
    let sortObj = {};
    switch (sort) {
      case 'date':
        sortObj.uploadedAt = order === 'asc' ? 1 : -1;
        break;
      case 'size':
        sortObj.size = order === 'asc' ? 1 : -1;
        break;
      case 'name':
        sortObj.originalName = order === 'asc' ? 1 : -1;
        break;
      default:
        sortObj.uploadedAt = -1;
    }

    // Get media with pagination
    const [media, total] = await Promise.all([
      Media.find(query)
        .sort(sortObj)
        .skip(skip)
        .limit(limit)
        .lean(),
      Media.countDocuments(query)
    ]);

    // Get statistics
    const stats = await Media.aggregate([
      {
        $group: {
          _id: null,
          totalImages: { $sum: 1 },
          totalSize: { $sum: '$size' },
          usedImages: {
            $sum: { $cond: [{ $gt: ['$usageCount', 0] }, 1, 0] }
          },
          unusedImages: {
            $sum: { $cond: [{ $eq: ['$usageCount', 0] }, 1, 0] }
          }
        }
      }
    ]);

    const statsData = stats[0] || {
      totalImages: 0,
      totalSize: 0,
      usedImages: 0,
      unusedImages: 0
    };

    res.json({
      success: true,
      data: media,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      },
      stats: statsData
    });
  } catch (error) {
    console.error('Error fetching media:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// GET /api/media/stats - Get media library statistics
router.get('/stats', async (req, res) => {
  try {
    const stats = await Media.aggregate([
      {
        $group: {
          _id: null,
          totalImages: { $sum: 1 },
          totalSize: { $sum: '$size' },
          usedImages: {
            $sum: { $cond: [{ $gt: ['$usageCount', 0] }, 1, 0] }
          },
          unusedImages: {
            $sum: { $cond: [{ $eq: ['$usageCount', 0] }, 1, 0] }
          },
          averageSize: { $avg: '$size' },
          oldestImage: { $min: '$uploadedAt' },
          newestImage: { $max: '$uploadedAt' }
        }
      }
    ]);

    const statsData = stats[0] || {
      totalImages: 0,
      totalSize: 0,
      usedImages: 0,
      unusedImages: 0,
      averageSize: 0,
      oldestImage: null,
      newestImage: null
    };

    res.json({
      success: true,
      stats: {
        ...statsData,
        totalSizeMB: (statsData.totalSize / (1024 * 1024)).toFixed(2)
      }
    });
  } catch (error) {
    console.error('Error fetching media stats:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// GET /api/media/:filename/usage - Check where image is used
router.get('/:filename/usage', async (req, res) => {
  try {
    const { filename } = req.params;
    
    // Validate filename to prevent path traversal
    if (filename.includes('..') || filename.includes('/')) {
      return res.status(400).json({
        success: false,
        message: 'Invalid filename'
      });
    }

    // Find media document
    const media = await Media.findOne({ filename });
    if (!media) {
      return res.status(404).json({
        success: false,
        message: 'Media not found'
      });
    }

    // Search for articles using this image
    const imageUrl = media.url;
    const articles = await Article.find({
      $or: [
        { content: { $regex: imageUrl, $options: 'i' } },
        { clinicalSignificance: { $regex: imageUrl, $options: 'i' } },
        { interpretation: { $regex: imageUrl, $options: 'i' } },
        { 'images.url': imageUrl }
      ]
    })
    .select('slug title')
    .lean();

    res.json({
      success: true,
      filename,
      usageCount: articles.length,
      articles: articles.map(a => ({ slug: a.slug, title: a.title }))
    });
  } catch (error) {
    console.error('Error checking media usage:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// DELETE /api/media/:filename - Delete an image
router.delete('/:filename', async (req, res) => {
  try {
    const { filename } = req.params;
    const force = req.query.force === 'true';
    
    // Validate filename to prevent path traversal
    if (filename.includes('..') || filename.includes('/')) {
      return res.status(400).json({
        success: false,
        message: 'Invalid filename'
      });
    }

    // Find media document
    const media = await Media.findOne({ filename });
    if (!media) {
      return res.status(404).json({
        success: false,
        message: 'Media not found'
      });
    }

    // Check if image is used in any articles
    const imageUrl = media.url;
    const articles = await Article.find({
      $or: [
        { content: { $regex: imageUrl, $options: 'i' } },
        { clinicalSignificance: { $regex: imageUrl, $options: 'i' } },
        { interpretation: { $regex: imageUrl, $options: 'i' } },
        { 'images.url': imageUrl }
      ]
    })
    .select('slug title')
    .lean();

    // If used and not forced, return error with article list
    if (articles.length > 0 && !force) {
      return res.status(400).json({
        success: false,
        message: `Image is used in ${articles.length} article(s)`,
        usedIn: articles.map(a => ({ slug: a.slug, title: a.title }))
      });
    }

    // Delete the physical file
    try {
      await imageStorage.delete(filename);
    } catch (fileError) {
      console.warn('Failed to delete physical file:', fileError.message);
      // Continue with database deletion even if file deletion fails
    }

    // Delete from database
    await Media.deleteOne({ filename });

    res.json({
      success: true,
      message: 'Media deleted successfully',
      deletedFile: filename
    });
  } catch (error) {
    console.error('Error deleting media:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;
