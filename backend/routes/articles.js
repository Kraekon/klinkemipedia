const express = require('express');
const router = express.Router();
const {
  getAllArticles,
  getArticleBySlug,
  createArticle,
  updateArticle,
  deleteArticle,
  getArticlesByCategory,
  searchArticles
} = require('../controllers/articleController');

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

// Update and delete routes by ID (using different parameter name to avoid confusion)
router.route('/id/:id')
  .put(updateArticle)
  .delete(deleteArticle);

module.exports = router;
