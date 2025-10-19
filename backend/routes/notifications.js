const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification
} = require('../controllers/notificationController');
const { protect } = require('../middleware/auth');

// Rate limiter for notification routes
const notificationLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30, // 30 requests per minute
  message: 'Too many notification requests, please try again later'
});

// All notification routes require authentication
router.use(protect);
router.use(notificationLimiter);

router.get('/', getNotifications);
router.put('/:id/read', markAsRead);
router.put('/read-all', markAllAsRead);
router.delete('/:id', deleteNotification);

module.exports = router;
