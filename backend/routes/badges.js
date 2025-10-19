const express = require('express');
const router = express.Router();
const {
  getAllBadges,
  createBadge,
  awardBadge
} = require('../controllers/badgeController');
const { protect, adminOnly } = require('../middleware/auth');

// Public routes
router.get('/', getAllBadges);

// Admin routes
router.post('/admin', protect, adminOnly, createBadge);
router.post('/admin/:badgeId/award/:userId', protect, adminOnly, awardBadge);

module.exports = router;
