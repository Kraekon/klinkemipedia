const express = require('express');
const router = express.Router();
const {
  getUserBookmarks,
  getBookmarkById,
  createBookmark,
  updateBookmark,
  deleteBookmark,
  checkBookmark
} = require('../controllers/bookmarkController');
const { protect } = require('../middleware/auth');
const rateLimit = require('express-rate-limit');

// Rate limiter for bookmark operations
const bookmarkLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per 15 minutes
  message: 'Too many bookmark requests, please try again later'
});

// Apply rate limiting and authentication to all routes
router.use(bookmarkLimiter);
router.use(protect);

// Routes
router.route('/')
  .get(getUserBookmarks)
  .post(createBookmark);

router.route('/:id')
  .get(getBookmarkById)
  .put(updateBookmark)
  .delete(deleteBookmark);

router.get('/check/:articleId', checkBookmark);

module.exports = router;
