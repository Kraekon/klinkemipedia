const mongoose = require('mongoose');

const CollectionSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Collection name is required'],
      trim: true,
      maxlength: [100, 'Collection name cannot be more than 100 characters']
    },
    description: {
      type: String,
      maxlength: [500, 'Description cannot be more than 500 characters'],
      trim: true,
      default: ''
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User is required']
    },
    isPublic: {
      type: Boolean,
      default: false
    },
    bookmarks: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Bookmark'
    }],
    color: {
      type: String,
      default: '#007bff',
      match: [/^#[0-9A-Fa-f]{6}$/, 'Color must be a valid hex color code']
    },
    icon: {
      type: String,
      default: '📚'
    }
  },
  {
    timestamps: true
  }
);

// Index for faster queries
CollectionSchema.index({ user: 1, name: 1 });
CollectionSchema.index({ isPublic: 1 });
CollectionSchema.index({ user: 1, createdAt: -1 });

// Virtual for bookmark count
CollectionSchema.virtual('bookmarkCount').get(function() {
  return this.bookmarks ? this.bookmarks.length : 0;
});

// Ensure virtuals are included when converting to JSON
CollectionSchema.set('toJSON', { virtuals: true });
CollectionSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Collection', CollectionSchema);
