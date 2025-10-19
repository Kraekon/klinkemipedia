const User = require('../models/User');
const Badge = require('../models/Badge');
const Notification = require('../models/Notification');

/**
 * Award reputation points to a user
 * @param {String} userId - User ID
 * @param {Number} points - Points to award (can be negative)
 * @param {String} reason - Reason for awarding points
 * @returns {Promise<Object>} Updated user
 */
const awardReputation = async (userId, points, reason) => {
  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Update reputation
    user.reputation = Math.max(0, user.reputation + points);
    await user.save();

    console.log(`Awarded ${points} reputation to user ${user.username} for: ${reason}`);
    
    // Check if user qualifies for new badges
    await checkAndAwardBadges(userId);

    return user;
  } catch (error) {
    console.error('Error awarding reputation:', error);
    throw error;
  }
};

/**
 * Check if user qualifies for any badges and award them
 * @param {String} userId - User ID
 * @returns {Promise<Array>} Array of newly awarded badges
 */
const checkAndAwardBadges = async (userId) => {
  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Get all auto badges
    const badges = await Badge.find({ type: 'auto' });
    const newBadges = [];

    // Calculate membership days
    const membershipDays = Math.floor(
      (Date.now() - user.createdAt.getTime()) / (1000 * 60 * 60 * 24)
    );

    for (const badge of badges) {
      // Skip if user already has this badge
      if (user.badges.includes(badge.name)) {
        continue;
      }

      // Check if user meets all criteria
      let qualifies = true;
      const criteria = badge.criteria;

      if (criteria.articlesWritten && user.stats.articlesWritten < criteria.articlesWritten) {
        qualifies = false;
      }
      if (criteria.reputation && user.reputation < criteria.reputation) {
        qualifies = false;
      }
      if (criteria.commentsPosted && user.stats.commentsPosted < criteria.commentsPosted) {
        qualifies = false;
      }
      if (criteria.upvotesReceived && user.stats.upvotesReceived < criteria.upvotesReceived) {
        qualifies = false;
      }
      if (criteria.membershipDays && membershipDays < criteria.membershipDays) {
        qualifies = false;
      }
      if (criteria.followersCount && user.followers.length < criteria.followersCount) {
        qualifies = false;
      }

      // Award badge if qualified
      if (qualifies) {
        user.badges.push(badge.name);
        newBadges.push(badge);

        // Create notification
        await createNotification({
          userId: user._id,
          type: 'badge_earned',
          title: 'Badge Earned!',
          message: `You've earned the ${badge.name} badge: ${badge.description}`,
          link: `/profile/${user.username}`
        });

        console.log(`Awarded badge ${badge.name} to user ${user.username}`);
      }
    }

    if (newBadges.length > 0) {
      await user.save();
    }

    return newBadges;
  } catch (error) {
    console.error('Error checking and awarding badges:', error);
    throw error;
  }
};

/**
 * Create a notification for a user
 * @param {Object} notificationData - Notification data
 * @returns {Promise<Object>} Created notification
 */
const createNotification = async (notificationData) => {
  try {
    const notification = await Notification.create(notificationData);
    console.log(`Created notification for user ${notificationData.userId}: ${notificationData.type}`);
    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
};

module.exports = {
  awardReputation,
  checkAndAwardBadges,
  createNotification
};
