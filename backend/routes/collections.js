const express = require('express');
const router = express.Router();
const {
  getUserCollections,
  getCollectionById,
  createCollection,
  updateCollection,
  deleteCollection,
  addBookmarkToCollection,
  removeBookmarkFromCollection,
  getPublicCollections
} = require('../controllers/collectionController');
const { protect } = require('../middleware/auth');
const rateLimit = require('express-rate-limit');

// Rate limiter for collection operations
const collectionLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per 15 minutes
  message: 'Too many collection requests, please try again later'
});

// Rate limiter for public routes (more permissive)
const publicCollectionLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // 200 requests per 15 minutes
  message: 'Too many requests, please try again later'
});

// Public routes
router.get('/public', publicCollectionLimiter, getPublicCollections);

// Protected routes
router.use(collectionLimiter);
router.use(protect);

router.route('/')
  .get(getUserCollections)
  .post(createCollection);

router.route('/:id')
  .get(getCollectionById)
  .put(updateCollection)
  .delete(deleteCollection);

router.post('/:id/bookmarks', addBookmarkToCollection);
router.delete('/:id/bookmarks/:bookmarkId', removeBookmarkFromCollection);

module.exports = router;
