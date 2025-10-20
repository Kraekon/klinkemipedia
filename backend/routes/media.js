const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const sharp = require('sharp');
const { protect } = require('../middleware/auth');
const Media = require('../models/Media');
const Article = require('../models/Article');

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

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadDir = 'uploads/images';
    try {
      await fs.mkdir(uploadDir, { recursive: true });
      cb(null, uploadDir);
    } catch (error) {
      cb(error);
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
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

// Helper function to sanitize filename and prevent path traversal
const sanitizeFilename = (filename) => {
  return path.basename(filename);
};

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
      // Check if image URL is in content or images array
      const imageUrl = `/uploads/images/${filename}`;
      const contentHasImage = article.content && article.content.includes(imageUrl);
      const imagesArrayHasImage = article.images && article.images.some(img => img.url.includes(filename));

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

// Helper function to get file stats
const getFileStats = async (filename) => {
  try {
    const filePath = path.join('uploads/images', filename);
    const stats = await fs.stat(filePath);
    
    // Get image dimensions using sharp
    const metadata = await sharp(filePath).metadata();
    
    return {
      size: stats.size,
      width: metadata.width,
      height: metadata.height,
      mtime: stats.mtime
    };
  } catch (error) {
    return null;
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

    const originalPath = req.file.path;
    const optimizedFilename = 'optimized-' + req.file.filename;
    const optimizedPath = path.join('uploads/images', optimizedFilename);

    // Optimize image with sharp
    const metadata = await sharp(originalPath)
      .resize(1200, 1200, {
        fit: 'inside',
        withoutEnlargement: true
      })
      .jpeg({ quality: 85 })
      .png({ compressionLevel: 8 })
      .toFile(optimizedPath);

    // Delete original unoptimized file
    await fs.unlink(originalPath);

    const imageUrl = `/uploads/images/${optimizedFilename}`;

    // Save to database
    try {
      const mediaDoc = new Media({
        filename: optimizedFilename,
        originalName: req.file.originalname,
        mimeType: req.file.mimetype,
        size: metadata.size || req.file.size,
        width: metadata.width,
        height: metadata.height,
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
        filename: optimizedFilename,
        url: imageUrl,
        originalName: req.file.originalname,
        size: metadata.size || req.file.size,
        width: metadata.width,
        height: metadata.height
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

    // Read files from disk
    const uploadDir = 'uploads/images';
    let files = [];
    
    try {
      await fs.mkdir(uploadDir, { recursive: true });
      const fileList = await fs.readdir(uploadDir);
      files = fileList.filter(file => /\.(jpg|jpeg|png|gif|webp)$/i.test(file));
    } catch (error) {
      console.error('Error reading upload directory:', error);
    }

    // Get media from database and merge with filesystem
    const mediaFromDb = await Media.find({});
    const mediaMap = new Map(mediaFromDb.map(m => [m.filename, m]));

    // Build complete media list
    const mediaList = [];
    for (const file of files) {
      const dbRecord = mediaMap.get(file);
      const fileStats = await getFileStats(file);
      
      if (!fileStats) continue;

      let mediaItem;
      if (dbRecord) {
        // Merge database record with file stats
        mediaItem = {
          _id: dbRecord._id,
          filename: dbRecord.filename,
          originalName: dbRecord.originalName,
          url: dbRecord.url,
          size: fileStats.size,
          width: fileStats.width,
          height: fileStats.height,
          mimeType: dbRecord.mimeType,
          uploadedBy: dbRecord.uploadedBy,
          uploadedAt: dbRecord.uploadedAt,
          usageCount: 0 // Will be calculated
        };
      } else {
        // File exists but not in database - create entry
        mediaItem = {
          _id: file,
          filename: file,
          originalName: file,
          url: `/uploads/images/${file}`,
          size: fileStats.size,
          width: fileStats.width,
          height: fileStats.height,
          mimeType: `image/${path.extname(file).substring(1)}`,
          uploadedBy: 'unknown',
          uploadedAt: fileStats.mtime,
          usageCount: 0
        };
      }

      // Check usage in articles
      const usage = await findImageUsageInArticles(file);
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
    const filename = sanitizeFilename(req.params.filename);
    
    // Check if file exists
    const filePath = path.join('uploads/images', filename);
    try {
      await fs.access(filePath);
    } catch (error) {
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
    const filename = sanitizeFilename(req.params.filename);
    const force = req.query.force === 'true';

    // Check if file exists
    const filePath = path.join('uploads/images', filename);
    try {
      await fs.access(filePath);
    } catch (error) {
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

    // Delete file from disk
    try {
      await fs.unlink(filePath);
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Error deleting file from disk',
        error: error.message
      });
    }

    // Delete from database if exists
    try {
      await Media.deleteOne({ filename });
    } catch (error) {
      console.error('Error deleting from database:', error);
      // Continue even if database deletion fails
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
