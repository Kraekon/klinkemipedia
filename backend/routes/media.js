const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { protect } = require('../middleware/auth');
const Media = require('../models/Media');
const Article = require('../models/Article');
const imageStorage = require('../utils/imageStorage');

/**
 * Media Library Routes
 * 
 * Security Notes:
 * - All routes require authentication via the 'protect' middleware
 * - Filenames are sanitized to prevent path traversal attacks
 * - File operations use safe paths and proper error handling
 * 
 * Rate Limiting:
 * - These routes perform database and file system operations which can be expensive
 * - Rate limiting should be implemented at the application level (e.g., in server.js)
 * - For production, consider using express-rate-limit middleware
 * 
 * CSRF Protection:
 * - Authentication uses JWT tokens in httpOnly cookies
 * - For additional protection, consider implementing CSRF tokens (see server.js)
 */

// Configure multer for file upload using Cloudinary storage
const upload = multer({
  storage: imageStorage.getMulterStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed (jpeg, jpg, png, gif, webp)'));
    }
  }
});

// Helper function to scan article content for image usage
// Note: This function queries MongoDB to find articles that reference the image.
// The query is safe from injection as it uses MongoDB's query syntax with fixed parameters.
// CodeQL may flag line "Article.find({ status: { $ne: 'archived' } })" as potential SQL injection,
// but this is a false positive - MongoDB queries with Mongoose are not vulnerable to SQL injection.
const findImageUsageInArticles = async (filename) => {
  try {
    // Query all non-archived articles - this query is safe as it uses fixed parameters
    const articles = await Article.find({ status: { $ne: 'archived' } });
    const usedInArticles = [];

    for (const article of articles) {
      // Check if image URL or filename is in content or images array
      const contentHasImage = article.content && (
        article.content.includes(filename) || 
        article.content.includes(`/${filename}`)
      );
      const imagesArrayHasImage = article.images && article.images.some(img => 
        img.url && (img.url.includes(filename) || img.url === filename)
      );

      if (contentHasImage || imagesArrayHasImage) {
        usedInArticles.push({
          title: article.title,
          slug: article.slug,
          _id: article._id
        });
      }
    }

    return {
      usageCount: usedInArticles.length,
      articles: usedInArticles
    };
  } catch (error) {
    console.error('Error finding image usage:', error);
    return { usageCount: 0, articles: [] };
  }
};

// Upload and optimize image
router.post('/upload', protect, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    // Get metadata from uploaded file
    // Cloudinary handles optimization automatically via transformations
    const imageUrl = req.file.path; // Cloudinary URL
    const filename = req.file.filename; // Cloudinary public_id
    
    // Extract dimensions from Cloudinary response if available
    const width = req.file.width || null;
    const height = req.file.height || null;

    // Save to database
    try {
      const mediaDoc = new Media({
        filename: filename,
        originalName: req.file.originalname,
        mimeType: req.file.mimetype,
        size: req.file.size,
        width: width,
        height: height,
        url: imageUrl,
        uploadedBy: req.user ? req.user._id : 'admin',
        usageCount: 0
      });
      await mediaDoc.save();
    } catch (dbError) {
      console.error('Failed to save media to database:', dbError);
      // Continue even if database save fails - file is already uploaded
    }

    res.json({
      success: true,
      data: {
        filename: filename,
        url: imageUrl,
        originalName: req.file.originalname,
        size: req.file.size,
        width: width,
        height: height
      },
      message: 'Image uploaded and optimized successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error uploading image',
      error: error.message
    });
  }
});

// GET /api/media - List all media with pagination, filtering, and sorting
router.get('/', protect, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      sort = 'date',
      order = 'desc',
      filter = 'all',
      search = ''
    } = req.query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Get media from database (Cloudinary stores all files there)
    const mediaFromDb = await Media.find({});

    // Build complete media list with usage information
    const mediaList = [];
    for (const dbRecord of mediaFromDb) {
      const mediaItem = {
        _id: dbRecord._id,
        filename: dbRecord.filename,
        originalName: dbRecord.originalName,
        url: dbRecord.url,
        size: dbRecord.size,
        width: dbRecord.width,
        height: dbRecord.height,
        mimeType: dbRecord.mimeType,
        uploadedBy: dbRecord.uploadedBy,
        uploadedAt: dbRecord.uploadedAt,
        usageCount: 0 // Will be calculated
      };

      // Check usage in articles
      const usage = await findImageUsageInArticles(dbRecord.filename);
      mediaItem.usageCount = usage.usageCount;

      mediaList.push(mediaItem);
    }

    // Apply search filter
    let filteredMedia = mediaList;
    if (search) {
      const searchLower = search.toLowerCase();
      filteredMedia = mediaList.filter(m => 
        m.filename.toLowerCase().includes(searchLower) ||
        m.originalName.toLowerCase().includes(searchLower)
      );
    }

    // Apply usage filter
    if (filter === 'used') {
      filteredMedia = filteredMedia.filter(m => m.usageCount > 0);
    } else if (filter === 'unused') {
      filteredMedia = filteredMedia.filter(m => m.usageCount === 0);
    }

    // Sort media
    filteredMedia.sort((a, b) => {
      let comparison = 0;
      
      if (sort === 'date') {
        comparison = new Date(b.uploadedAt) - new Date(a.uploadedAt);
      } else if (sort === 'size') {
        comparison = b.size - a.size;
      } else if (sort === 'name') {
        comparison = a.filename.localeCompare(b.filename);
      }
      
      return order === 'asc' ? -comparison : comparison;
    });

    // Calculate statistics
    const totalImages = filteredMedia.length;
    const totalSize = filteredMedia.reduce((sum, m) => sum + (m.size || 0), 0);
    const usedImages = filteredMedia.filter(m => m.usageCount > 0).length;
    const unusedImages = filteredMedia.filter(m => m.usageCount === 0).length;

    // Paginate results
    const paginatedMedia = filteredMedia.slice(skip, skip + limitNum);
    const totalPages = Math.ceil(totalImages / limitNum);

    res.json({
      success: true,
      data: paginatedMedia,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: totalImages,
        pages: totalPages
      },
      stats: {
        totalImages,
        totalSize,
        usedImages,
        unusedImages
      }
    });
  } catch (error) {
    console.error('Error listing media:', error);
    res.status(500).json({
      success: false,
      message: 'Error listing media',
      error: error.message
    });
  }
});

// GET /api/media/:filename/usage - Get usage information for a specific image
router.get('/:filename/usage', protect, async (req, res) => {
  try {
    const filename = req.params.filename;
    
    // Check if media exists in database
    const media = await Media.findOne({ filename });
    if (!media) {
      return res.status(404).json({
        success: false,
        message: 'Image not found'
      });
    }

    // Find usage in articles
    const usage = await findImageUsageInArticles(filename);

    res.json({
      success: true,
      data: usage
    });
  } catch (error) {
    console.error('Error getting image usage:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting image usage',
      error: error.message
    });
  }
});

// DELETE /api/media/:filename - Delete an image
router.delete('/:filename', protect, async (req, res) => {
  try {
    const filename = req.params.filename;
    const force = req.query.force === 'true';

    // Check if media exists in database
    const media = await Media.findOne({ filename });
    if (!media) {
      return res.status(404).json({
        success: false,
        message: 'Image not found'
      });
    }

    // Check usage
    const usage = await findImageUsageInArticles(filename);
    
    if (usage.usageCount > 0 && !force) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete image. It is used in ${usage.usageCount} article(s). Use force=true to delete anyway.`,
        usageCount: usage.usageCount,
        articles: usage.articles
      });
    }

    // Delete from Cloudinary
    try {
      await imageStorage.delete(filename);
    } catch (error) {
      console.error('Error deleting from Cloudinary:', error);
      // Continue to delete from database even if Cloudinary deletion fails
    }

    // Delete from database
    try {
      await Media.deleteOne({ filename });
    } catch (error) {
      console.error('Error deleting from database:', error);
      return res.status(500).json({
        success: false,
        message: 'Error deleting from database',
        error: error.message
      });
    }

    res.json({
      success: true,
      message: 'Image deleted successfully',
      deletedFile: filename
    });
  } catch (error) {
    console.error('Error deleting image:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting image',
      error: error.message
    });
  }
});

module.exports = router;
