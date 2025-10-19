const Collection = require('../models/Collection');
const Bookmark = require('../models/Bookmark');

// @desc    Get all collections for the authenticated user
// @route   GET /api/collections
// @access  Private
const getUserCollections = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const filter = { user: req.user._id };

    const collections = await Collection.find(filter)
      .populate({
        path: 'bookmarks',
        populate: {
          path: 'article',
          select: 'title slug summary category tags'
        }
      })
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip);

    const total = await Collection.countDocuments(filter);

    res.json({
      success: true,
      count: collections.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: collections
    });
  } catch (error) {
    console.error('Error in getUserCollections:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching collections',
      error: error.message
    });
  }
};

// @desc    Get a single collection by ID
// @route   GET /api/collections/:id
// @access  Private/Public (if collection is public)
const getCollectionById = async (req, res) => {
  try {
    const collection = await Collection.findById(req.params.id)
      .populate({
        path: 'bookmarks',
        populate: {
          path: 'article',
          select: 'title slug summary category tags views createdAt'
        }
      })
      .populate('user', 'username avatar');

    if (!collection) {
      return res.status(404).json({
        success: false,
        message: 'Collection not found'
      });
    }

    // Check access permissions
    const isOwner = req.user && collection.user._id.toString() === req.user._id.toString();
    if (!collection.isPublic && !isOwner) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this collection'
      });
    }

    res.json({
      success: true,
      data: collection
    });
  } catch (error) {
    console.error('Error in getCollectionById:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching collection',
      error: error.message
    });
  }
};

// @desc    Create a new collection
// @route   POST /api/collections
// @access  Private
const createCollection = async (req, res) => {
  try {
    const { name, description, isPublic, color, icon } = req.body;

    // Validate required fields
    if (!name || name.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Collection name is required'
      });
    }

    // Check if collection name already exists for this user
    const existingCollection = await Collection.findOne({
      user: req.user._id,
      name: name.trim()
    });

    if (existingCollection) {
      return res.status(400).json({
        success: false,
        message: 'You already have a collection with this name'
      });
    }

    const collection = await Collection.create({
      name: name.trim(),
      description: description || '',
      user: req.user._id,
      isPublic: isPublic || false,
      color: color || '#007bff',
      icon: icon || '📚',
      bookmarks: []
    });

    res.status(201).json({
      success: true,
      data: collection
    });
  } catch (error) {
    console.error('Error in createCollection:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating collection',
      error: error.message
    });
  }
};

// @desc    Update a collection
// @route   PUT /api/collections/:id
// @access  Private
const updateCollection = async (req, res) => {
  try {
    const { name, description, isPublic, color, icon } = req.body;

    let collection = await Collection.findById(req.params.id);

    if (!collection) {
      return res.status(404).json({
        success: false,
        message: 'Collection not found'
      });
    }

    // Check if collection belongs to authenticated user
    if (collection.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this collection'
      });
    }

    // Check for duplicate name if name is being changed
    if (name && name !== collection.name) {
      const existingCollection = await Collection.findOne({
        user: req.user._id,
        name: name.trim(),
        _id: { $ne: collection._id }
      });

      if (existingCollection) {
        return res.status(400).json({
          success: false,
          message: 'You already have a collection with this name'
        });
      }
    }

    // Update fields
    if (name !== undefined) collection.name = name.trim();
    if (description !== undefined) collection.description = description;
    if (isPublic !== undefined) collection.isPublic = isPublic;
    if (color !== undefined) collection.color = color;
    if (icon !== undefined) collection.icon = icon;

    await collection.save();

    const populatedCollection = await Collection.findById(collection._id)
      .populate({
        path: 'bookmarks',
        populate: {
          path: 'article',
          select: 'title slug summary category tags'
        }
      });

    res.json({
      success: true,
      data: populatedCollection
    });
  } catch (error) {
    console.error('Error in updateCollection:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating collection',
      error: error.message
    });
  }
};

// @desc    Delete a collection
// @route   DELETE /api/collections/:id
// @access  Private
const deleteCollection = async (req, res) => {
  try {
    const collection = await Collection.findById(req.params.id);

    if (!collection) {
      return res.status(404).json({
        success: false,
        message: 'Collection not found'
      });
    }

    // Check if collection belongs to authenticated user
    if (collection.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this collection'
      });
    }

    // Remove collection reference from bookmarks
    await Bookmark.updateMany(
      { collections: collection._id },
      { $pull: { collections: collection._id } }
    );

    await collection.deleteOne();

    res.json({
      success: true,
      message: 'Collection deleted successfully'
    });
  } catch (error) {
    console.error('Error in deleteCollection:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting collection',
      error: error.message
    });
  }
};

// @desc    Add bookmark to collection
// @route   POST /api/collections/:id/bookmarks
// @access  Private
const addBookmarkToCollection = async (req, res) => {
  try {
    const { bookmarkId } = req.body;

    if (!bookmarkId) {
      return res.status(400).json({
        success: false,
        message: 'Bookmark ID is required'
      });
    }

    const collection = await Collection.findById(req.params.id);

    if (!collection) {
      return res.status(404).json({
        success: false,
        message: 'Collection not found'
      });
    }

    // Check if collection belongs to authenticated user
    if (collection.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to modify this collection'
      });
    }

    // Verify bookmark exists and belongs to user
    const bookmark = await Bookmark.findOne({
      _id: bookmarkId,
      user: req.user._id
    });

    if (!bookmark) {
      return res.status(404).json({
        success: false,
        message: 'Bookmark not found or does not belong to you'
      });
    }

    // Check if bookmark is already in collection
    if (collection.bookmarks.includes(bookmarkId)) {
      return res.status(400).json({
        success: false,
        message: 'Bookmark already in collection'
      });
    }

    // Add bookmark to collection
    collection.bookmarks.push(bookmarkId);
    await collection.save();

    // Add collection to bookmark
    if (!bookmark.collections.includes(collection._id)) {
      bookmark.collections.push(collection._id);
      await bookmark.save();
    }

    const populatedCollection = await Collection.findById(collection._id)
      .populate({
        path: 'bookmarks',
        populate: {
          path: 'article',
          select: 'title slug summary category tags'
        }
      });

    res.json({
      success: true,
      data: populatedCollection
    });
  } catch (error) {
    console.error('Error in addBookmarkToCollection:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while adding bookmark to collection',
      error: error.message
    });
  }
};

// @desc    Remove bookmark from collection
// @route   DELETE /api/collections/:id/bookmarks/:bookmarkId
// @access  Private
const removeBookmarkFromCollection = async (req, res) => {
  try {
    const { bookmarkId } = req.params;

    const collection = await Collection.findById(req.params.id);

    if (!collection) {
      return res.status(404).json({
        success: false,
        message: 'Collection not found'
      });
    }

    // Check if collection belongs to authenticated user
    if (collection.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to modify this collection'
      });
    }

    // Remove bookmark from collection
    collection.bookmarks = collection.bookmarks.filter(
      id => id.toString() !== bookmarkId
    );
    await collection.save();

    // Remove collection from bookmark
    await Bookmark.findByIdAndUpdate(bookmarkId, {
      $pull: { collections: collection._id }
    });

    const populatedCollection = await Collection.findById(collection._id)
      .populate({
        path: 'bookmarks',
        populate: {
          path: 'article',
          select: 'title slug summary category tags'
        }
      });

    res.json({
      success: true,
      data: populatedCollection
    });
  } catch (error) {
    console.error('Error in removeBookmarkFromCollection:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while removing bookmark from collection',
      error: error.message
    });
  }
};

// @desc    Get public collections
// @route   GET /api/collections/public
// @access  Public
const getPublicCollections = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const collections = await Collection.find({ isPublic: true })
      .populate('user', 'username avatar')
      .populate({
        path: 'bookmarks',
        populate: {
          path: 'article',
          select: 'title slug summary category tags'
        }
      })
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip);

    const total = await Collection.countDocuments({ isPublic: true });

    res.json({
      success: true,
      count: collections.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: collections
    });
  } catch (error) {
    console.error('Error in getPublicCollections:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching public collections',
      error: error.message
    });
  }
};

module.exports = {
  getUserCollections,
  getCollectionById,
  createCollection,
  updateCollection,
  deleteCollection,
  addBookmarkToCollection,
  removeBookmarkFromCollection,
  getPublicCollections
};
