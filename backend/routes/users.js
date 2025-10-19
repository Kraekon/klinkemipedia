const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  getUserProfile,
  updateProfile,
  uploadAvatar,
  changePassword,
  followUser,
  unfollowUser,
  getUserActivity,
  getUserFollowers,
  getUserFollowing,
  getLeaderboard
} = require('../controllers/userController');
const { adminAuth, protect } = require('../middleware/auth');
const rateLimit = require('express-rate-limit');

// Rate limiter for follow actions
const followLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // 10 requests per minute
  message: 'Too many follow/unfollow requests, please try again later'
});

// Configure multer for avatar uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../public/uploads/avatars'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'avatar-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 2 * 1024 * 1024 // 2MB max file size
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only JPG, PNG, and GIF images are allowed'));
    }
  }
});

// Rate limiter for public user routes
const publicUserLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per 15 minutes
  message: 'Too many requests from this IP, please try again later'
});

// Public routes - specific routes before dynamic params
router.get('/leaderboard', publicUserLimiter, getLeaderboard);
router.get('/profile/:username', publicUserLimiter, getUserProfile);
router.get('/profile/:username/activity', publicUserLimiter, getUserActivity);
router.get('/profile/:username/followers', publicUserLimiter, getUserFollowers);
router.get('/profile/:username/following', publicUserLimiter, getUserFollowing);

// Protected routes (require authentication)
router.put('/profile', protect, updateProfile);
router.post('/avatar', protect, upload.single('avatar'), uploadAvatar);
router.put('/password', protect, changePassword);
router.post('/:id/follow', protect, followLimiter, followUser);
router.delete('/:id/follow', protect, followLimiter, unfollowUser);

// Admin routes
router.use('/admin', adminAuth);
router.route('/admin')
  .get(getAllUsers)
  .post(createUser);

router.route('/admin/:id')
  .get(getUserById)
  .put(updateUser)
  .delete(deleteUser);

module.exports = router;
