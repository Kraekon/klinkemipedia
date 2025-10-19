const express = require('express');
const router = express.Router();
const multer = require('multer');
const imageStorage = require('../utils/imageStorage');
const sizeOf = require('image-size');
const {
  getAllArticles,
  getArticleBySlug,
  createArticle,
  updateArticle,
  deleteArticle,
  getArticlesByCategory,
  searchArticles,
  getRelatedArticles,
  getPopularArticles
} = require('../controllers/articleController');

// Configure multer for image uploads
const upload = multer({
  storage: imageStorage.getMulterStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB max file size
  },
  fileFilter: (req, file, cb) => {
    // Accept only image files
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPG, JPEG, PNG, GIF, and WEBP images are allowed.'), false);
    }
  }
});

// Image upload endpoint (must be before :slug route to avoid conflicts)
router.post('/upload', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No image file provided'
      });
    }

    // Process uploaded file through storage abstraction
    const fileInfo = await imageStorage.upload(req.file);
    
    // Extract image dimensions
    const path = require('path');
    const imagePath = path.join(__dirname, '..', 'public', 'uploads', req.file.filename);
    let dimensions = { width: null, height: null };
    try {
      dimensions = sizeOf(imagePath);
    } catch (err) {
      console.warn('Failed to extract image dimensions:', err.message);
    }

    // Save media metadata to database
    const Media = require('../models/Media');
    const mediaDoc = await Media.create({
      filename: fileInfo.filename,
      originalName: fileInfo.originalName,
      mimeType: fileInfo.mimetype,
      size: fileInfo.size,
      width: dimensions.width,
      height: dimensions.height,
      url: fileInfo.url,
      uploadedBy: req.body.uploadedBy || req.headers['x-uploaded-by'] || 'admin'
    });
    
    res.json({
      success: true,
      imageUrl: fileInfo.url,
      alt: req.file.originalname.replace(/\.[^/.]+$/, ''), // Remove extension for alt text
      filename: fileInfo.filename,
      size: fileInfo.size,
      media: mediaDoc
    });
  } catch (error) {
    console.error('Image upload error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to upload image'
    });
  }
});

// Search route (must be before :slug route to avoid conflicts)
router.get('/search', searchArticles);

// Popular articles route (must be before :slug route to avoid conflicts)
router.get('/popular', getPopularArticles);

// Tags route (must be before :slug route to avoid conflicts)
router.get('/tags', async (req, res) => {
  try {
    const tags = await require('../models/Article').distinct('tags');
    res.json({ success: true, data: tags });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Category route (must be before :slug route to avoid conflicts)
router.get('/category/:category', getArticlesByCategory);

// Main article routes
router.route('/')
  .get(getAllArticles)
  .post(createArticle);

// Single article routes by slug
router.route('/:slug')
  .get(getArticleBySlug)
  .put(async (req, res) => {
    try {
      const Article = require('../models/Article');
      const ArticleRevision = require('../models/ArticleRevision');
      const Media = require('../models/Media');
      
      // Find the current article before updating
      const currentArticle = await Article.findOne({ slug: req.params.slug });
      if (!currentArticle) {
        return res.status(404).json({ success: false, message: 'Article not found' });
      }

      // Save current version as a revision before updating
      const editedBy = req.body.editedBy || req.headers['x-edited-by'] || 'admin';
      const changeDescription = req.body.changeDescription || '';
      
      await ArticleRevision.createFromArticle(currentArticle, editedBy, changeDescription);

      // Now update the article
      const updatedArticle = await Article.findOneAndUpdate(
        { slug: req.params.slug },
        req.body,
        { new: true, runValidators: true }
      );
      
      // Update media usage counts
      const { updateMediaUsageCounts } = require('../controllers/articleController');
      if (updateMediaUsageCounts) {
        await updateMediaUsageCounts();
      }
      
      res.json({ success: true, data: updatedArticle });
    } catch (error) {
      console.error('Error updating article:', error);
      res.status(400).json({ success: false, message: error.message });
    }
  })
  .delete(async (req, res) => {
    try {
      const Article = require('../models/Article');
      const article = await Article.findOneAndDelete({ slug: req.params.slug });
      if (!article) {
        return res.status(404).json({ success: false, message: 'Article not found' });
      }
      res.json({ success: true, message: 'Article deleted successfully' });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  });

// Related articles route
router.get('/related/:slug', getRelatedArticles);

// Version history routes
// Get all revisions for an article (paginated)
router.get('/:slug/revisions', async (req, res) => {
  try {
    const Article = require('../models/Article');
    const ArticleRevision = require('../models/ArticleRevision');
    
    // Find the article first
    const article = await Article.findOne({ slug: req.params.slug });
    if (!article) {
      return res.status(404).json({ success: false, message: 'Article not found' });
    }

    // Pagination parameters
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    // Get revisions
    const revisions = await ArticleRevision.find({ articleId: article._id })
      .sort({ versionNumber: -1 })
      .skip(skip)
      .limit(limit)
      .select('versionNumber timestamp editedBy changeDescription')
      .lean();

    // Get total count
    const total = await ArticleRevision.countDocuments({ articleId: article._id });

    res.json({
      success: true,
      data: revisions,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching revisions:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get specific revision
router.get('/:slug/revisions/:versionNumber', async (req, res) => {
  try {
    const Article = require('../models/Article');
    const ArticleRevision = require('../models/ArticleRevision');
    
    // Find the article
    const article = await Article.findOne({ slug: req.params.slug });
    if (!article) {
      return res.status(404).json({ success: false, message: 'Article not found' });
    }

    const versionNumber = parseInt(req.params.versionNumber);
    const revision = await ArticleRevision.findOne({
      articleId: article._id,
      versionNumber
    });

    if (!revision) {
      return res.status(404).json({ success: false, message: 'Revision not found' });
    }

    res.json({ success: true, data: revision });
  } catch (error) {
    console.error('Error fetching revision:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Restore article to a previous version
router.post('/:slug/restore/:versionNumber', async (req, res) => {
  try {
    const Article = require('../models/Article');
    const ArticleRevision = require('../models/ArticleRevision');
    
    // Find the article
    const article = await Article.findOne({ slug: req.params.slug });
    if (!article) {
      return res.status(404).json({ success: false, message: 'Article not found' });
    }

    const versionNumber = parseInt(req.params.versionNumber);
    const revision = await ArticleRevision.findOne({
      articleId: article._id,
      versionNumber
    });

    if (!revision) {
      return res.status(404).json({ success: false, message: 'Revision not found' });
    }

    // Save current version before restoring
    const editedBy = req.body.editedBy || req.headers['x-edited-by'] || 'admin';
    await ArticleRevision.createFromArticle(
      article,
      editedBy,
      `Restored to version ${versionNumber}`
    );

    // Update article with revision data
    const restoredArticle = await Article.findByIdAndUpdate(
      article._id,
      {
        title: revision.title,
        content: revision.content,
        summary: revision.summary,
        category: revision.category,
        tags: revision.tags,
        referenceRanges: revision.referenceRanges,
        clinicalSignificance: revision.clinicalSignificance,
        interpretation: revision.interpretation,
        relatedTests: revision.relatedTests,
        references: revision.references,
        images: revision.images,
        status: revision.status
      },
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      data: restoredArticle,
      message: `Article restored to version ${versionNumber}`
    });
  } catch (error) {
    console.error('Error restoring revision:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Compare two versions
router.get('/:slug/compare', async (req, res) => {
  try {
    const Article = require('../models/Article');
    const ArticleRevision = require('../models/ArticleRevision');
    
    const v1 = parseInt(req.query.v1);
    const v2 = parseInt(req.query.v2);

    if (!v1 || !v2) {
      return res.status(400).json({
        success: false,
        message: 'Both v1 and v2 version numbers are required'
      });
    }

    // Find the article
    const article = await Article.findOne({ slug: req.params.slug });
    if (!article) {
      return res.status(404).json({ success: false, message: 'Article not found' });
    }

    // Get both revisions
    const [revision1, revision2] = await Promise.all([
      ArticleRevision.findOne({ articleId: article._id, versionNumber: v1 }),
      ArticleRevision.findOne({ articleId: article._id, versionNumber: v2 })
    ]);

    if (!revision1 || !revision2) {
      return res.status(404).json({ success: false, message: 'One or both revisions not found' });
    }

    // Simple comparison - return both versions with highlighted differences
    const differences = {
      title: revision1.title !== revision2.title,
      content: revision1.content !== revision2.content,
      summary: revision1.summary !== revision2.summary,
      category: revision1.category !== revision2.category,
      tags: JSON.stringify(revision1.tags) !== JSON.stringify(revision2.tags),
      referenceRanges: JSON.stringify(revision1.referenceRanges) !== JSON.stringify(revision2.referenceRanges),
      clinicalSignificance: revision1.clinicalSignificance !== revision2.clinicalSignificance,
      interpretation: revision1.interpretation !== revision2.interpretation,
      relatedTests: JSON.stringify(revision1.relatedTests) !== JSON.stringify(revision2.relatedTests),
      references: JSON.stringify(revision1.references) !== JSON.stringify(revision2.references),
      images: JSON.stringify(revision1.images) !== JSON.stringify(revision2.images),
      status: revision1.status !== revision2.status
    };

    res.json({
      success: true,
      data: {
        version1: revision1,
        version2: revision2,
        differences
      }
    });
  } catch (error) {
    console.error('Error comparing revisions:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update and delete routes by ID (using different parameter name to avoid confusion)
router.route('/id/:id')
  .put(updateArticle)
  .delete(deleteArticle);

module.exports = router;
