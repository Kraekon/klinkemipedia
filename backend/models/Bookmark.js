const mongoose = require('mongoose');

const BookmarkSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User is required']
    },
    article: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Article',
      required: [true, 'Article is required']
    },
    notes: {
      type: String,
      maxlength: [1000, 'Notes cannot be more than 1000 characters'],
      trim: true,
      default: ''
    },
    collections: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Collection'
    }],
    isFavorite: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

// Compound index to ensure user can only bookmark an article once
BookmarkSchema.index({ user: 1, article: 1 }, { unique: true });

// Index for faster queries
BookmarkSchema.index({ user: 1, createdAt: -1 });
BookmarkSchema.index({ article: 1 });
BookmarkSchema.index({ collections: 1 });
BookmarkSchema.index({ isFavorite: 1 });

module.exports = mongoose.model('Bookmark', BookmarkSchema);
