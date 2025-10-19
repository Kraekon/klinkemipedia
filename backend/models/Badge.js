const mongoose = require('mongoose');

const BadgeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add a badge name'],
      unique: true,
      trim: true
    },
    description: {
      type: String,
      required: [true, 'Please add a badge description'],
      trim: true
    },
    icon: {
      type: String,
      required: [true, 'Please add a badge icon'],
      default: '🏆'
    },
    type: {
      type: String,
      enum: ['auto', 'admin'],
      default: 'auto'
    },
    criteria: {
      articlesWritten: {
        type: Number,
        min: 0
      },
      reputation: {
        type: Number,
        min: 0
      },
      commentsPosted: {
        type: Number,
        min: 0
      },
      upvotesReceived: {
        type: Number,
        min: 0
      },
      membershipDays: {
        type: Number,
        min: 0
      },
      followersCount: {
        type: Number,
        min: 0
      }
    }
  },
  {
    timestamps: true
  }
);

// Index for faster queries
BadgeSchema.index({ name: 1 });

module.exports = mongoose.model('Badge', BadgeSchema);
