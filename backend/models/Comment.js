const mongoose = require('mongoose');

const CommentSchema = new mongoose.Schema(
  {
    articleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Article',
      required: [true, 'Article ID is required']
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required']
    },
    parentCommentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Comment',
      default: null
    },
    content: {
      type: String,
      required: [true, 'Comment content is required'],
      trim: true,
      maxlength: [2000, 'Comment cannot be more than 2000 characters']
    },
    upvotes: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }],
    downvotes: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }],
    status: {
      type: String,
      enum: ['approved', 'pending', 'spam', 'deleted'],
      default: 'approved'
    },
    isEdited: {
      type: Boolean,
      default: false
    },
    editedAt: {
      type: Date
    },
    reports: [{
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
      },
      reason: {
        type: String,
        required: true,
        trim: true,
        maxlength: [500, 'Report reason cannot be more than 500 characters']
      },
      createdAt: {
        type: Date,
        default: Date.now
      }
    }]
  },
  {
    timestamps: true
  }
);

// Indexes for better performance
CommentSchema.index({ articleId: 1, createdAt: -1 });
CommentSchema.index({ userId: 1 });
CommentSchema.index({ parentCommentId: 1 });
CommentSchema.index({ status: 1 });

// Virtual for reply count
CommentSchema.virtual('replyCount', {
  ref: 'Comment',
  localField: '_id',
  foreignField: 'parentCommentId',
  count: true
});

// Method to get vote score
CommentSchema.methods.getScore = function() {
  return this.upvotes.length - this.downvotes.length;
};

// Method to check if user has voted
CommentSchema.methods.getUserVote = function(userId) {
  if (!userId) return null;
  
  const userIdStr = userId.toString();
  const hasUpvoted = this.upvotes.some(id => id.toString() === userIdStr);
  const hasDownvoted = this.downvotes.some(id => id.toString() === userIdStr);
  
  if (hasUpvoted) return 'upvote';
  if (hasDownvoted) return 'downvote';
  return null;
};

module.exports = mongoose.model('Comment', CommentSchema);
