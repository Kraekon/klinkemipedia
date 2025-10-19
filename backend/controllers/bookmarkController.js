const Bookmark = require('../models/Bookmark');
const Article = require('../models/Article');
const Collection = require('../models/Collection');

// @desc    Get all bookmarks for the authenticated user
// @route   GET /api/bookmarks
// @access  Private
const getUserBookmarks = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    // Build filter
    const filter = { user: req.user._id };
    
    // Filter by favorite - validate boolean
    if (req.query.favorite === 'true') {
      filter.isFavorite = true;
    }
    
    // Filter by collection - validate ObjectId format
    if (req.query.collection) {
      const mongoose = require('mongoose');
      if (mongoose.Types.ObjectId.isValid(req.query.collection)) {
        filter.collections = req.query.collection;
      } else {
        return res.status(400).json({
          success: false,
          message: 'Invalid collection ID format'
        });
      }
    }

    const bookmarks = await Bookmark.find(filter)
      .populate('article', 'title slug summary category tags views createdAt')
      .populate('collections', 'name color icon')
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip);

    const total = await Bookmark.countDocuments(filter);

    res.json({
      success: true,
      count: bookmarks.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: bookmarks
    });
  } catch (error) {
    console.error('Error in getUserBookmarks:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching bookmarks',
      error: error.message
    });
  }
};

// @desc    Get a single bookmark by ID
// @route   GET /api/bookmarks/:id
// @access  Private
const getBookmarkById = async (req, res) => {
  try {
    const bookmark = await Bookmark.findById(req.params.id)
      .populate('article')
      .populate('collections', 'name color icon');

    if (!bookmark) {
      return res.status(404).json({
        success: false,
        message: 'Bookmark not found'
      });
    }

    // Check if bookmark belongs to authenticated user
    if (bookmark.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this bookmark'
      });
    }

    res.json({
      success: true,
      data: bookmark
    });
  } catch (error) {
    console.error('Error in getBookmarkById:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching bookmark',
      error: error.message
    });
  }
};

// @desc    Create a new bookmark
// @route   POST /api/bookmarks
// @access  Private
const createBookmark = async (req, res) => {
  try {
    const { articleId, notes, collections, isFavorite } = req.body;

    // Validate articleId format
    const mongoose = require('mongoose');
    if (!articleId || !mongoose.Types.ObjectId.isValid(articleId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid article ID format'
      });
    }

    // Validate article exists
    const article = await Article.findById(articleId);
    if (!article) {
      return res.status(404).json({
        success: false,
        message: 'Article not found'
      });
    }

    // Check if bookmark already exists
    const existingBookmark = await Bookmark.findOne({
      user: req.user._id,
      article: articleId
    });

    if (existingBookmark) {
      return res.status(400).json({
        success: false,
        message: 'Article already bookmarked'
      });
    }

    // Validate collections belong to user
    if (collections && collections.length > 0) {
      // Validate all collection IDs are valid ObjectIds
      const mongoose = require('mongoose');
      const invalidIds = collections.filter(id => !mongoose.Types.ObjectId.isValid(id));
      if (invalidIds.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Invalid collection ID format'
        });
      }

      const userCollections = await Collection.find({
        _id: { $in: collections },
        user: req.user._id
      });

      if (userCollections.length !== collections.length) {
        return res.status(400).json({
          success: false,
          message: 'One or more collections not found or do not belong to you'
        });
      }
    }

    // Create bookmark
    const bookmark = await Bookmark.create({
      user: req.user._id,
      article: articleId,
      notes: notes || '',
      collections: collections || [],
      isFavorite: isFavorite || false
    });

    // Update article bookmark count
    await Article.findByIdAndUpdate(articleId, {
      $inc: { bookmarkCount: 1 }
    });

    // Add bookmark to collections
    if (collections && collections.length > 0) {
      await Collection.updateMany(
        { _id: { $in: collections } },
        { $addToSet: { bookmarks: bookmark._id } }
      );
    }

    const populatedBookmark = await Bookmark.findById(bookmark._id)
      .populate('article', 'title slug summary category tags')
      .populate('collections', 'name color icon');

    res.status(201).json({
      success: true,
      data: populatedBookmark
    });
  } catch (error) {
    console.error('Error in createBookmark:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating bookmark',
      error: error.message
    });
  }
};

// @desc    Update a bookmark
// @route   PUT /api/bookmarks/:id
// @access  Private
const updateBookmark = async (req, res) => {
  try {
    const { notes, collections, isFavorite } = req.body;

    let bookmark = await Bookmark.findById(req.params.id);

    if (!bookmark) {
      return res.status(404).json({
        success: false,
        message: 'Bookmark not found'
      });
    }

    // Check if bookmark belongs to authenticated user
    if (bookmark.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this bookmark'
      });
    }

    // Validate collections belong to user
    if (collections && collections.length > 0) {
      // Validate all collection IDs are valid ObjectIds
      const mongoose = require('mongoose');
      const invalidIds = collections.filter(id => !mongoose.Types.ObjectId.isValid(id));
      if (invalidIds.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Invalid collection ID format'
        });
      }

      const userCollections = await Collection.find({
        _id: { $in: collections },
        user: req.user._id
      });

      if (userCollections.length !== collections.length) {
        return res.status(400).json({
          success: false,
          message: 'One or more collections not found or do not belong to you'
        });
      }

      // Remove bookmark from old collections
      await Collection.updateMany(
        { bookmarks: bookmark._id },
        { $pull: { bookmarks: bookmark._id } }
      );

      // Add bookmark to new collections
      await Collection.updateMany(
        { _id: { $in: collections } },
        { $addToSet: { bookmarks: bookmark._id } }
      );
    }

    // Update bookmark
    if (notes !== undefined) bookmark.notes = notes;
    if (collections !== undefined) bookmark.collections = collections;
    if (isFavorite !== undefined) bookmark.isFavorite = isFavorite;

    await bookmark.save();

    const populatedBookmark = await Bookmark.findById(bookmark._id)
      .populate('article', 'title slug summary category tags')
      .populate('collections', 'name color icon');

    res.json({
      success: true,
      data: populatedBookmark
    });
  } catch (error) {
    console.error('Error in updateBookmark:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating bookmark',
      error: error.message
    });
  }
};

// @desc    Delete a bookmark
// @route   DELETE /api/bookmarks/:id
// @access  Private
const deleteBookmark = async (req, res) => {
  try {
    const bookmark = await Bookmark.findById(req.params.id);

    if (!bookmark) {
      return res.status(404).json({
        success: false,
        message: 'Bookmark not found'
      });
    }

    // Check if bookmark belongs to authenticated user
    if (bookmark.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this bookmark'
      });
    }

    // Update article bookmark count
    await Article.findByIdAndUpdate(bookmark.article, {
      $inc: { bookmarkCount: -1 }
    });

    // Remove bookmark from collections
    await Collection.updateMany(
      { bookmarks: bookmark._id },
      { $pull: { bookmarks: bookmark._id } }
    );

    await bookmark.deleteOne();

    res.json({
      success: true,
      message: 'Bookmark deleted successfully'
    });
  } catch (error) {
    console.error('Error in deleteBookmark:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting bookmark',
      error: error.message
    });
  }
};

// @desc    Check if article is bookmarked by user
// @route   GET /api/bookmarks/check/:articleId
// @access  Private
const checkBookmark = async (req, res) => {
  try {
    const bookmark = await Bookmark.findOne({
      user: req.user._id,
      article: req.params.articleId
    });

    res.json({
      success: true,
      isBookmarked: !!bookmark,
      bookmark: bookmark || null
    });
  } catch (error) {
    console.error('Error in checkBookmark:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while checking bookmark',
      error: error.message
    });
  }
};

module.exports = {
  getUserBookmarks,
  getBookmarkById,
  createBookmark,
  updateBookmark,
  deleteBookmark,
  checkBookmark
};
