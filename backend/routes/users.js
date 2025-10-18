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
