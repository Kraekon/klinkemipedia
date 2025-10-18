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

// Category route (must be before :slug route to avoid conflicts)
router.get('/category/:category', getArticlesByCategory);

// Main article routes
router.route('/')
  .get(getAllArticles)
  .post(createArticle);

// Single article routes by slug
router.route('/:slug')
  .get(getArticleBySlug);

// Update and delete routes by ID (using different parameter name to avoid confusion)
router.route('/id/:id')
  .put(updateArticle)
  .delete(deleteArticle);

module.exports = router;
