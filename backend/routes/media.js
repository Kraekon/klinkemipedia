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
    const search = req.query.search || '';
    
    const skip = (page - 1) * limit;

    // Build query
    let query = {};
    if (filter === 'used') {
      query.usageCount = { $gt: 0 };
    } else if (filter === 'unused') {
      query.usageCount = 0;
    }

    // Add search support
    if (search) {
      query.$or = [
        { filename: { $regex: search, $options: 'i' } },
        { originalName: { $regex: search, $options: 'i' } }
      ];
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

// GET /api/media/analytics - Get comprehensive analytics data
router.get('/analytics', async (req, res) => {
  try {
    // Get basic statistics
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

    // Get most used images (top 10)
    const mostUsed = await Media.find({ usageCount: { $gt: 0 } })
      .sort({ usageCount: -1 })
      .limit(10)
      .lean();

    // Get largest images (top 10)
    const largestImages = await Media.find()
      .sort({ size: -1 })
      .limit(10)
      .lean();

    // Get storage by MIME type
    const storageByType = await Media.aggregate([
      {
        $group: {
          _id: '$mimeType',
          totalSize: { $sum: '$size' },
          count: { $sum: 1 }
        }
      }
    ]);

    const storageByTypeObj = {};
    storageByType.forEach(item => {
      storageByTypeObj[item._id] = item.totalSize;
    });

    res.json({
      success: true,
      data: {
        totalImages: statsData.totalImages,
        totalSize: statsData.totalSize,
        usedImages: statsData.usedImages,
        unusedImages: statsData.unusedImages,
        mostUsed,
        largestImages,
        storageByType: storageByTypeObj
      }
    });
  } catch (error) {
    console.error('Error fetching media analytics:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// GET /api/media/:idOrFilename/usage - Check where image is used
router.get('/:idOrFilename/usage', async (req, res) => {
  try {
    const { idOrFilename } = req.params;
    
    // Try to find by ID first, then by filename
    let media;
    
    // Check if it's a MongoDB ObjectId
    if (idOrFilename.match(/^[0-9a-fA-F]{24}$/)) {
      media = await Media.findById(idOrFilename);
    }
    
    // If not found by ID, try filename
    if (!media) {
      // Validate filename to prevent path traversal
      if (idOrFilename.includes('..') || idOrFilename.includes('/')) {
        return res.status(400).json({
          success: false,
          message: 'Invalid filename'
        });
      }
      media = await Media.findOne({ filename: idOrFilename });
    }

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
      data: {
        usageCount: articles.length,
        articles: articles.map(a => ({ 
          _id: a._id,
          slug: a.slug, 
          title: a.title,
          url: `/article/${a.slug}`
        }))
      }
    });
  } catch (error) {
    console.error('Error checking media usage:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// DELETE /api/media/bulk - Bulk delete multiple images
router.delete('/bulk', async (req, res) => {
  try {
    const { imageIds } = req.body;

    if (!imageIds || !Array.isArray(imageIds) || imageIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'imageIds array is required'
      });
    }

    const results = {
      deleted: 0,
      failed: 0,
      errors: []
    };

    // Process each image
    for (const id of imageIds) {
      try {
        // Validate ObjectId
        if (!id.match(/^[0-9a-fA-F]{24}$/)) {
          results.failed++;
          results.errors.push({ id, error: 'Invalid ID format' });
          continue;
        }

        // Find media document
        const media = await Media.findById(id);
        if (!media) {
          results.failed++;
          results.errors.push({ id, error: 'Media not found' });
          continue;
        }

        // Delete the physical file
        try {
          await imageStorage.delete(media.filename);
        } catch (fileError) {
          console.warn('Failed to delete physical file:', fileError.message);
          // Continue with database deletion even if file deletion fails
        }

        // Delete from database
        await Media.deleteOne({ _id: id });
        results.deleted++;
      } catch (error) {
        results.failed++;
        results.errors.push({ id, error: error.message });
      }
    }

    res.json({
      success: true,
      deleted: results.deleted,
      failed: results.failed,
      errors: results.errors
    });
  } catch (error) {
    console.error('Error bulk deleting media:', error);
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
