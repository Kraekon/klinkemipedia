const express = require('express');
const router = express.Router();
const {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser
} = require('../controllers/userController');
const { adminAuth } = require('../middleware/auth');

// Apply admin authentication to all routes
router.use(adminAuth);

// NOTE: Rate limiting should be implemented in production
// Consider using express-rate-limit middleware for production deployments
// Example: const rateLimit = require('express-rate-limit');
// const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100 });
// router.use(limiter);

// Main user routes
router.route('/')
  .get(getAllUsers)
  .post(createUser);

// Single user routes by ID
router.route('/:id')
  .get(getUserById)
  .put(updateUser)
  .delete(deleteUser);

module.exports = router;
