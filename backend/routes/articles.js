const express = require('express');
const router = express.Router();
const multer = require('multer');
const imageStorage = require('../utils/imageStorage');
const {
  getAllArticles,
  getArticleBySlug,
  createArticle,
  updateArticle,
  deleteArticle,
  getArticlesByCategory,
  searchArticles,
  getRelatedArticles
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
    
    res.json({
      success: true,
      imageUrl: fileInfo.url,
      alt: req.file.originalname.replace(/\.[^/.]+$/, ''), // Remove extension for alt text
      filename: fileInfo.filename,
      size: fileInfo.size
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
      const article = await Article.findOneAndUpdate(
        { slug: req.params.slug },
        req.body,
        { new: true, runValidators: true }
      );
      if (!article) {
        return res.status(404).json({ success: false, message: 'Article not found' });
      }
      res.json({ success: true, data: article });
    } catch (error) {
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

// Related articles route (must be after main :slug route to be specific)
router.get('/:slug/related', getRelatedArticles);

// Update and delete routes by ID (using different parameter name to avoid confusion)
router.route('/id/:id')
  .put(updateArticle)
  .delete(deleteArticle);

module.exports = router;
