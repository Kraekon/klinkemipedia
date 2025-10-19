const mongoose = require('mongoose');
require('dotenv').config();
const Badge = require('../models/Badge');

const badges = [
  {
    name: 'Contributor',
    description: 'Write your first article',
    icon: '✍️',
    type: 'auto',
    criteria: {
      articlesWritten: 1
    }
  },
  {
    name: 'Prolific Writer',
    description: 'Write 10 articles',
    icon: '📚',
    type: 'auto',
    criteria: {
      articlesWritten: 10
    }
  },
  {
    name: 'Expert',
    description: 'Reach 500 reputation points',
    icon: '🎓',
    type: 'auto',
    criteria: {
      reputation: 500
    }
  },
  {
    name: 'Master',
    description: 'Reach 1000 reputation points',
    icon: '👑',
    type: 'auto',
    criteria: {
      reputation: 1000
    }
  },
  {
    name: 'Helpful',
    description: 'Receive 50 comment upvotes',
    icon: '🤝',
    type: 'auto',
    criteria: {
      upvotesReceived: 50
    }
  },
  {
    name: 'Veteran',
    description: '1 year membership',
    icon: '⭐',
    type: 'auto',
    criteria: {
      membershipDays: 365
    }
  },
  {
    name: 'Moderator',
    description: 'Awarded by admin for moderation duties',
    icon: '🛡️',
    type: 'admin',
    criteria: {}
  },
  {
    name: 'Community Leader',
    description: 'Gain 100 followers',
    icon: '🌟',
    type: 'auto',
    criteria: {
      followersCount: 100
    }
  }
];

const seedBadges = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('Connected to MongoDB');

    // Clear existing badges (optional - comment out if you want to keep existing)
    // await Badge.deleteMany({});
    // console.log('Cleared existing badges');

    // Insert badges
    for (const badge of badges) {
      const existing = await Badge.findOne({ name: badge.name });
      if (existing) {
        console.log(`Badge "${badge.name}" already exists, updating...`);
        await Badge.findByIdAndUpdate(existing._id, badge);
      } else {
        await Badge.create(badge);
        console.log(`Created badge: ${badge.name}`);
      }
    }

    console.log('Badge seeding completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding badges:', error);
    process.exit(1);
  }
};

seedBadges();
