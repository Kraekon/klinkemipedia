const express = require('express');
const router = express.Router();
const {
  getAllCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory,
  getCategoryArticles,
  reorderCategories
} = require('../controllers/categoryController');
const { protect, adminOnly } = require('../middleware/auth');

// Public routes
router.get('/', getAllCategories);
router.get('/:id', getCategory);
router.get('/:id/articles', getCategoryArticles);

// Admin routes - use protect + adminOnly instead of adminAuth
router.post('/', protect, adminOnly, createCategory);
router.put('/:id', protect, adminOnly, updateCategory);
router.delete('/:id', protect, adminOnly, deleteCategory);
router.put('/reorder', protect, adminOnly, reorderCategories);

module.exports = router;