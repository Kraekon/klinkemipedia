const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/auth');
const Comment = require('../models/Comment');
const Article = require('../models/Article');
const User = require('../models/User');

// Input validation helper
const validateCommentContent = (content) => {
  if (!content || typeof content !== 'string') {
    return 'Comment content is required';
  }
  const trimmed = content.trim();
  if (trimmed.length === 0) {
    return 'Comment cannot be empty';
  }
  if (trimmed.length > 2000) {
    return 'Comment cannot be more than 2000 characters';
  }
  return null;
};

// XSS prevention - escape HTML
const escapeHtml = (text) => {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
    '/': '&#x2F;'
  };
  return text.replace(/[&<>"'/]/g, (m) => map[m]);
};

// Helper to build comment tree
const buildCommentTree = (comments, parentId = null, depth = 0, maxDepth = 5) => {
  if (depth >= maxDepth) return [];
  
  return comments
    .filter(comment => {
      const commentParentId = comment.parentCommentId ? comment.parentCommentId.toString() : null;
      return commentParentId === parentId;
    })
    .map(comment => ({
      ...comment.toObject(),
      replies: buildCommentTree(comments, comment._id.toString(), depth + 1, maxDepth)
    }));
};

// Helper to update article comment count
const updateArticleCommentCount = async (articleId) => {
  const count = await Comment.countDocuments({ 
    articleId, 
    status: { $in: ['approved', 'pending'] } 
  });
  await Article.findByIdAndUpdate(articleId, { commentCount: count });
};

// GET /api/articles/:slug/comments - Get all comments for an article
router.get('/articles/:slug/comments', async (req, res) => {
  try {
    const article = await Article.findOne({ slug: req.params.slug });
    if (!article) {
      return res.status(404).json({
        success: false,
        message: 'Article not found'
      });
    }

    const sort = req.query.sort || 'newest';
    let sortOption = { createdAt: -1 }; // newest first
    
    if (sort === 'oldest') {
      sortOption = { createdAt: 1 };
    } else if (sort === 'top') {
      // Sort by score (upvotes - downvotes)
      // We'll calculate this in memory after fetching
    }

    const comments = await Comment.find({ 
      articleId: article._id,
      status: { $in: ['approved', 'pending'] }
    })
      .populate('userId', 'username profile.firstName profile.lastName')
      .sort(sortOption)
      .lean();

    // Calculate score for each comment and add user vote info
    const userId = req.user ? req.user._id.toString() : null;
    const enrichedComments = comments.map(comment => {
      const score = comment.upvotes.length - comment.downvotes.length;
      let userVote = null;
      
      if (userId) {
        const hasUpvoted = comment.upvotes.some(id => id.toString() === userId);
        const hasDownvoted = comment.downvotes.some(id => id.toString() === userId);
        if (hasUpvoted) userVote = 'upvote';
        else if (hasDownvoted) userVote = 'downvote';
      }
      
      return {
        ...comment,
        score,
        userVote,
        // Hide vote arrays from response for privacy
        upvotes: comment.upvotes.length,
        downvotes: comment.downvotes.length
      };
    });

    // Sort by top if requested
    if (sort === 'top') {
      enrichedComments.sort((a, b) => b.score - a.score);
    }

    // Build comment tree (nested replies)
    const commentTree = buildCommentTree(enrichedComments);

    res.json({
      success: true,
      data: commentTree,
      count: enrichedComments.length
    });
  } catch (error) {
    console.error('Error fetching comments:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch comments'
    });
  }
});

// POST /api/articles/:slug/comments - Create a new comment (requires auth)
router.post('/articles/:slug/comments', protect, async (req, res) => {
  try {
    const article = await Article.findOne({ slug: req.params.slug });
    if (!article) {
      return res.status(404).json({
        success: false,
        message: 'Article not found'
      });
    }

    const { content } = req.body;
    
    // Validate content
    const validationError = validateCommentContent(content);
    if (validationError) {
      return res.status(400).json({
        success: false,
        message: validationError
      });
    }

    // Escape HTML to prevent XSS
    const sanitizedContent = escapeHtml(content.trim());

    // Create comment
    const comment = await Comment.create({
      articleId: article._id,
      userId: req.user._id,
      content: sanitizedContent,
      status: 'approved' // Auto-approve for now, can be changed to 'pending' for moderation
    });

    // Update article comment count
    await updateArticleCommentCount(article._id);

    // Populate user info
    await comment.populate('userId', 'username profile.firstName profile.lastName');

    res.status(201).json({
      success: true,
      data: comment
    });
  } catch (error) {
    console.error('Error creating comment:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to create comment'
    });
  }
});

// PUT /api/comments/:id - Edit own comment (requires auth)
router.put('/comments/:id', protect, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    
    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found'
      });
    }

    // Check ownership
    if (comment.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only edit your own comments'
      });
    }

    // Check if comment is deleted
    if (comment.status === 'deleted') {
      return res.status(400).json({
        success: false,
        message: 'Cannot edit deleted comment'
      });
    }

    const { content } = req.body;
    
    // Validate content
    const validationError = validateCommentContent(content);
    if (validationError) {
      return res.status(400).json({
        success: false,
        message: validationError
      });
    }

    // Escape HTML to prevent XSS
    const sanitizedContent = escapeHtml(content.trim());

    // Update comment
    comment.content = sanitizedContent;
    comment.isEdited = true;
    comment.editedAt = Date.now();
    await comment.save();

    await comment.populate('userId', 'username profile.firstName profile.lastName');

    res.json({
      success: true,
      data: comment
    });
  } catch (error) {
    console.error('Error editing comment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to edit comment'
    });
  }
});

// DELETE /api/comments/:id - Delete own comment (requires auth)
router.delete('/comments/:id', protect, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    
    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found'
      });
    }

    // Check ownership or admin
    if (comment.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You can only delete your own comments'
      });
    }

    // Soft delete - mark as deleted instead of removing
    comment.status = 'deleted';
    comment.content = '[Comment deleted]';
    await comment.save();

    // Update article comment count
    await updateArticleCommentCount(comment.articleId);

    res.json({
      success: true,
      message: 'Comment deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting comment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete comment'
    });
  }
});

// POST /api/comments/:id/reply - Reply to a comment (requires auth)
router.post('/comments/:id/reply', protect, async (req, res) => {
  try {
    const parentComment = await Comment.findById(req.params.id);
    
    if (!parentComment) {
      return res.status(404).json({
        success: false,
        message: 'Parent comment not found'
      });
    }

    // Check if parent is deleted
    if (parentComment.status === 'deleted') {
      return res.status(400).json({
        success: false,
        message: 'Cannot reply to deleted comment'
      });
    }

    // Check depth limit (max 5 levels)
    let depth = 1;
    let currentParent = parentComment;
    while (currentParent.parentCommentId && depth < 5) {
      currentParent = await Comment.findById(currentParent.parentCommentId);
      depth++;
    }
    
    if (depth >= 5) {
      return res.status(400).json({
        success: false,
        message: 'Maximum reply depth reached (5 levels)'
      });
    }

    const { content } = req.body;
    
    // Validate content
    const validationError = validateCommentContent(content);
    if (validationError) {
      return res.status(400).json({
        success: false,
        message: validationError
      });
    }

    // Escape HTML to prevent XSS
    const sanitizedContent = escapeHtml(content.trim());

    // Create reply
    const reply = await Comment.create({
      articleId: parentComment.articleId,
      userId: req.user._id,
      parentCommentId: parentComment._id,
      content: sanitizedContent,
      status: 'approved'
    });

    // Update article comment count
    await updateArticleCommentCount(parentComment.articleId);

    // Populate user info
    await reply.populate('userId', 'username profile.firstName profile.lastName');

    res.status(201).json({
      success: true,
      data: reply
    });
  } catch (error) {
    console.error('Error creating reply:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create reply'
    });
  }
});

// POST /api/comments/:id/upvote - Upvote a comment (requires auth)
router.post('/comments/:id/upvote', protect, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    
    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found'
      });
    }

    const userId = req.user._id;
    const userIdStr = userId.toString();

    // Remove from downvotes if present
    comment.downvotes = comment.downvotes.filter(id => id.toString() !== userIdStr);

    // Toggle upvote
    const upvoteIndex = comment.upvotes.findIndex(id => id.toString() === userIdStr);
    if (upvoteIndex > -1) {
      // Already upvoted, remove upvote
      comment.upvotes.splice(upvoteIndex, 1);
    } else {
      // Add upvote
      comment.upvotes.push(userId);
    }

    await comment.save();

    const score = comment.upvotes.length - comment.downvotes.length;
    const userVote = comment.upvotes.some(id => id.toString() === userIdStr) ? 'upvote' : null;

    res.json({
      success: true,
      data: {
        _id: comment._id,
        score,
        upvotes: comment.upvotes.length,
        downvotes: comment.downvotes.length,
        userVote
      }
    });
  } catch (error) {
    console.error('Error upvoting comment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upvote comment'
    });
  }
});

// POST /api/comments/:id/downvote - Downvote a comment (requires auth)
router.post('/comments/:id/downvote', protect, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    
    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found'
      });
    }

    const userId = req.user._id;
    const userIdStr = userId.toString();

    // Remove from upvotes if present
    comment.upvotes = comment.upvotes.filter(id => id.toString() !== userIdStr);

    // Toggle downvote
    const downvoteIndex = comment.downvotes.findIndex(id => id.toString() === userIdStr);
    if (downvoteIndex > -1) {
      // Already downvoted, remove downvote
      comment.downvotes.splice(downvoteIndex, 1);
    } else {
      // Add downvote
      comment.downvotes.push(userId);
    }

    await comment.save();

    const score = comment.upvotes.length - comment.downvotes.length;
    const userVote = comment.downvotes.some(id => id.toString() === userIdStr) ? 'downvote' : null;

    res.json({
      success: true,
      data: {
        _id: comment._id,
        score,
        upvotes: comment.upvotes.length,
        downvotes: comment.downvotes.length,
        userVote
      }
    });
  } catch (error) {
    console.error('Error downvoting comment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to downvote comment'
    });
  }
});

// DELETE /api/comments/:id/vote - Remove vote (requires auth)
router.delete('/comments/:id/vote', protect, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    
    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found'
      });
    }

    const userId = req.user._id;
    const userIdStr = userId.toString();

    // Remove from both upvotes and downvotes
    comment.upvotes = comment.upvotes.filter(id => id.toString() !== userIdStr);
    comment.downvotes = comment.downvotes.filter(id => id.toString() !== userIdStr);

    await comment.save();

    const score = comment.upvotes.length - comment.downvotes.length;

    res.json({
      success: true,
      data: {
        _id: comment._id,
        score,
        upvotes: comment.upvotes.length,
        downvotes: comment.downvotes.length,
        userVote: null
      }
    });
  } catch (error) {
    console.error('Error removing vote:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to remove vote'
    });
  }
});

// POST /api/comments/:id/report - Report a comment (requires auth)
router.post('/comments/:id/report', protect, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    
    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found'
      });
    }

    const { reason } = req.body;
    
    if (!reason || typeof reason !== 'string' || reason.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Report reason is required'
      });
    }

    if (reason.trim().length > 500) {
      return res.status(400).json({
        success: false,
        message: 'Report reason cannot be more than 500 characters'
      });
    }

    // Check if user already reported this comment
    const alreadyReported = comment.reports.some(
      report => report.userId.toString() === req.user._id.toString()
    );

    if (alreadyReported) {
      return res.status(400).json({
        success: false,
        message: 'You have already reported this comment'
      });
    }

    // Add report
    comment.reports.push({
      userId: req.user._id,
      reason: escapeHtml(reason.trim()),
      createdAt: Date.now()
    });

    // Auto-mark as spam if many reports (e.g., 5 reports)
    if (comment.reports.length >= 5) {
      comment.status = 'spam';
    }

    await comment.save();

    res.json({
      success: true,
      message: 'Comment reported successfully'
    });
  } catch (error) {
    console.error('Error reporting comment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to report comment'
    });
  }
});

// Admin routes

// GET /api/admin/comments - Get all comments with filters (admin only)
router.get('/admin/comments', protect, adminOnly, async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    const filter = {};
    if (status) {
      filter.status = status;
    }

    const comments = await Comment.find(filter)
      .populate('userId', 'username email')
      .populate('articleId', 'title slug')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    const total = await Comment.countDocuments(filter);

    res.json({
      success: true,
      data: comments,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching admin comments:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch comments'
    });
  }
});

// PUT /api/admin/comments/:id/approve - Approve comment (admin only)
router.put('/admin/comments/:id/approve', protect, adminOnly, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    
    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found'
      });
    }

    comment.status = 'approved';
    await comment.save();

    // Update article comment count
    await updateArticleCommentCount(comment.articleId);

    res.json({
      success: true,
      data: comment
    });
  } catch (error) {
    console.error('Error approving comment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to approve comment'
    });
  }
});

// PUT /api/admin/comments/:id/reject - Reject comment (admin only)
router.put('/admin/comments/:id/reject', protect, adminOnly, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    
    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found'
      });
    }

    comment.status = 'spam';
    await comment.save();

    // Update article comment count
    await updateArticleCommentCount(comment.articleId);

    res.json({
      success: true,
      data: comment
    });
  } catch (error) {
    console.error('Error rejecting comment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reject comment'
    });
  }
});

// DELETE /api/admin/comments/:id - Delete comment permanently (admin only)
router.delete('/admin/comments/:id', protect, adminOnly, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    
    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found'
      });
    }

    const articleId = comment.articleId;
    
    // Delete all replies recursively
    const deleteReplies = async (commentId) => {
      const replies = await Comment.find({ parentCommentId: commentId });
      for (const reply of replies) {
        await deleteReplies(reply._id);
        await Comment.findByIdAndDelete(reply._id);
      }
    };
    
    await deleteReplies(comment._id);
    await Comment.findByIdAndDelete(req.params.id);

    // Update article comment count
    await updateArticleCommentCount(articleId);

    res.json({
      success: true,
      message: 'Comment and all replies deleted permanently'
    });
  } catch (error) {
    console.error('Error deleting comment permanently:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete comment'
    });
  }
});

module.exports = router;
