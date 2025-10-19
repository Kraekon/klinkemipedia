const Badge = require('../models/Badge');
const User = require('../models/User');
const { createNotification } = require('../utils/reputation');

// @desc    Get all badges
// @route   GET /api/badges
// @access  Public
const getAllBadges = async (req, res) => {
  try {
    const badges = await Badge.find().sort({ createdAt: 1 });

    res.json({
      success: true,
      count: badges.length,
      data: badges
    });
  } catch (error) {
    console.error('Error in getAllBadges:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching badges',
      error: error.message
    });
  }
};

// @desc    Create new badge
// @route   POST /api/badges/admin
// @access  Private/Admin
const createBadge = async (req, res) => {
  try {
    const badge = await Badge.create(req.body);

    res.status(201).json({
      success: true,
      message: 'Badge created successfully',
      data: badge
    });
  } catch (error) {
    console.error('Error in createBadge:', error);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: messages
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error while creating badge',
      error: error.message
    });
  }
};

// @desc    Award badge to user manually
// @route   POST /api/badges/admin/:badgeId/award/:userId
// @access  Private/Admin
const awardBadge = async (req, res) => {
  try {
    const { badgeId, userId } = req.params;

    const badge = await Badge.findById(badgeId);
    if (!badge) {
      return res.status(404).json({
        success: false,
        message: 'Badge not found'
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if user already has this badge
    if (user.badges.includes(badge.name)) {
      return res.status(400).json({
        success: false,
        message: 'User already has this badge'
      });
    }

    // Award badge
    user.badges.push(badge.name);
    await user.save();

    // Create notification
    await createNotification({
      userId: user._id,
      type: 'badge_earned',
      title: 'Badge Earned!',
      message: `You've earned the ${badge.name} badge: ${badge.description}`,
      link: `/profile/${user.username}`
    });

    res.json({
      success: true,
      message: `Badge "${badge.name}" awarded to ${user.username}`,
      data: {
        badge,
        user: {
          _id: user._id,
          username: user.username,
          badges: user.badges
        }
      }
    });
  } catch (error) {
    console.error('Error in awardBadge:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while awarding badge',
      error: error.message
    });
  }
};

module.exports = {
  getAllBadges,
  createBadge,
  awardBadge
};
