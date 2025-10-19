const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const {
  getAllBadges,
  createBadge,
  awardBadge
} = require('../controllers/badgeController');
const { protect, adminOnly } = require('../middleware/auth');

// Rate limiter for public badge routes
const badgeLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per 15 minutes
  message: 'Too many requests from this IP, please try again later'
});

// Public routes
router.get('/', badgeLimiter, getAllBadges);

// Admin routes
router.post('/admin', protect, adminOnly, createBadge);
router.post('/admin/:badgeId/award/:userId', protect, adminOnly, awardBadge);

module.exports = router;
