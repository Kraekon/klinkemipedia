const Article = require('../models/Article');
const Media = require('../models/Media');

// Helper function to extract image URLs from article content
const extractImageUrls = (article) => {
  const urls = new Set();
  
  // Extract from content
  if (article.content) {
    const contentMatches = article.content.match(/\/uploads\/[^\s"')]+/g);
    if (contentMatches) contentMatches.forEach(url => urls.add(url));
  }
  
  // Extract from clinicalSignificance
  if (article.clinicalSignificance) {
    const csMatches = article.clinicalSignificance.match(/\/uploads\/[^\s"')]+/g);
    if (csMatches) csMatches.forEach(url => urls.add(url));
  }
  
  // Extract from interpretation
  if (article.interpretation) {
    const intMatches = article.interpretation.match(/\/uploads\/[^\s"')]+/g);
    if (intMatches) intMatches.forEach(url => urls.add(url));
  }
  
  // Extract from images array
  if (article.images && Array.isArray(article.images)) {
    article.images.forEach(img => {
      if (img.url) urls.add(img.url);
    });
  }
  
  return Array.from(urls);
};

// Helper function to update media usage counts
const updateMediaUsageCounts = async () => {
  try {
    // Get all articles
    const articles = await Article.find({}).select('content clinicalSignificance interpretation images');
    
    // Get all media
    const allMedia = await Media.find({});
    
    // Count usage for each media file
    const usageCounts = {};
    
    articles.forEach(article => {
      const imageUrls = extractImageUrls(article);
      imageUrls.forEach(url => {
        usageCounts[url] = (usageCounts[url] || 0) + 1;
      });
    });
    
    // Update each media document
    const updatePromises = allMedia.map(media => {
      const count = usageCounts[media.url] || 0;
      return Media.updateOne({ _id: media._id }, { usageCount: count });
    });
    
    await Promise.all(updatePromises);
  } catch (error) {
    console.error('Error updating media usage counts:', error);
  }
};

// Helper function to generate slug from title
const generateSlug = (title) => {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove non-word chars (except spaces and hyphens)
    .replace(/[\s_-]+/g, '-') // Replace spaces, underscores, and multiple hyphens with single hyphen
    .replace(/^-+|-+$/g, ''); // Remove leading and trailing hyphens
};

// @desc    Get all articles with pagination and filtering
// @route   GET /api/articles
// @access  Public
const getAllArticles = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Build filter object
    const filter = {};
    if (req.query.category) {
      filter.category = req.query.category;
    }
    if (req.query.status) {
      filter.status = req.query.status;
    } else {
      // Default to published articles only if no status specified
      filter.status = 'published';
    }
    if (req.query.tags) {
      // Support comma-separated tags
      const tags = req.query.tags.split(',').map(tag => tag.trim());
      filter.tags = { $in: tags };
    }

    const articles = await Article.find(filter)
      .select('-content') // Exclude full content for list view
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip);

    const total = await Article.countDocuments(filter);

    res.json({
      success: true,
      count: articles.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: articles
    });
  } catch (error) {
    console.error('Error in getAllArticles:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching articles',
      error: error.message
    });
  }
};

// @desc    Get single article by slug
// @route   GET /api/articles/:slug
// @access  Public
const getArticleBySlug = async (req, res) => {
  try {
    const article = await Article.findOne({ slug: req.params.slug });

    if (!article) {
      return res.status(404).json({
        success: false,
        message: 'Article not found'
      });
    }

    // Increment view count
    article.views += 1;
    await article.save();

    res.json({
      success: true,
      data: article
    });
  } catch (error) {
    console.error('Error in getArticleBySlug:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching article',
      error: error.message
    });
  }
};

// @desc    Create new article
// @route   POST /api/articles
// @access  Private (TODO: Add authentication)
const createArticle = async (req, res) => {
  try {
    // Generate slug from title if not provided
    if (!req.body.slug && req.body.title) {
      req.body.slug = generateSlug(req.body.title);
    }

    // Check if slug already exists
    const existingArticle = await Article.findOne({ slug: req.body.slug });
    if (existingArticle) {
      return res.status(400).json({
        success: false,
        message: 'An article with this slug already exists'
      });
    }

    const article = await Article.create(req.body);
    
    // Update media usage counts
    await updateMediaUsageCounts();

    res.status(201).json({
      success: true,
      message: 'Article created successfully',
      data: article
    });
  } catch (error) {
    console.error('Error in createArticle:', error);
    
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
      message: 'Server error while creating article',
      error: error.message
    });
  }
};

// @desc    Update article
// @route   PUT /api/articles/:id
// @access  Private (TODO: Add authentication)
const updateArticle = async (req, res) => {
  try {
    // If title is being updated, regenerate slug
    if (req.body.title && !req.body.slug) {
      req.body.slug = generateSlug(req.body.title);
    }

    const article = await Article.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true, // Return updated document
        runValidators: true // Run schema validators
      }
    );

    if (!article) {
      return res.status(404).json({
        success: false,
        message: 'Article not found'
      });
    }
    
    // Update media usage counts
    await updateMediaUsageCounts();

    res.json({
      success: true,
      message: 'Article updated successfully',
      data: article
    });
  } catch (error) {
    console.error('Error in updateArticle:', error);
    
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
      message: 'Server error while updating article',
      error: error.message
    });
  }
};

// @desc    Delete article
// @route   DELETE /api/articles/:id
// @access  Private (TODO: Add authentication)
const deleteArticle = async (req, res) => {
  try {
    const article = await Article.findByIdAndDelete(req.params.id);

    if (!article) {
      return res.status(404).json({
        success: false,
        message: 'Article not found'
      });
    }

    res.json({
      success: true,
      message: 'Article deleted successfully',
      data: {}
    });
  } catch (error) {
    console.error('Error in deleteArticle:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting article',
      error: error.message
    });
  }
};

// @desc    Get articles by category
// @route   GET /api/articles/category/:category
// @access  Public
const getArticlesByCategory = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const articles = await Article.find({
      category: req.params.category,
      status: 'published'
    })
      .select('-content')
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip);

    const total = await Article.countDocuments({
      category: req.params.category,
      status: 'published'
    });

    res.json({
      success: true,
      count: articles.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      category: req.params.category,
      data: articles
    });
  } catch (error) {
    console.error('Error in getArticlesByCategory:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching articles by category',
      error: error.message
    });
  }
};

// @desc    Search articles
// @route   GET /api/articles/search?q=query
// @access  Public
const searchArticles = async (req, res) => {
  try {
    const searchQuery = req.query.q;
    
    if (!searchQuery) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a search query'
      });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Search using text index
    const articles = await Article.find(
      {
        $text: { $search: searchQuery },
        status: 'published'
      },
      {
        score: { $meta: 'textScore' }
      }
    )
      .select('-content')
      .sort({ score: { $meta: 'textScore' } })
      .limit(limit)
      .skip(skip);

    const total = await Article.countDocuments({
      $text: { $search: searchQuery },
      status: 'published'
    });

    res.json({
      success: true,
      count: articles.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      query: searchQuery,
      data: articles
    });
  } catch (error) {
    console.error('Error in searchArticles:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while searching articles',
      error: error.message
    });
  }
};

// @desc    Get related articles for a given article
// @route   GET /api/articles/:slug/related
// @access  Public
const getRelatedArticles = async (req, res) => {
  try {
    const article = await Article.findOne({ slug: req.params.slug });

    if (!article) {
      return res.status(404).json({
        success: false,
        message: 'Article not found'
      });
    }

    const limit = parseInt(req.query.limit) || 5;

    // Algorithm to find related articles:
    // 1. Same category (highest priority)
    // 2. Shared tags
    // 3. Related tests mentioned in the article
    // 4. Similar titles (text search)
    
    // Build query to find related articles
    const relatedQuery = {
      _id: { $ne: article._id }, // Exclude the current article
      status: 'published'
    };

    // Find articles with scoring based on relevance
    const relatedArticles = await Article.aggregate([
      { $match: relatedQuery },
      {
        $addFields: {
          relevanceScore: {
            $add: [
              // Same category: 10 points
              { $cond: [{ $eq: ['$category', article.category] }, 10, 0] },
              // Shared tags: 5 points per tag
              {
                $multiply: [
                  {
                    $size: {
                      $ifNull: [
                        { $setIntersection: ['$tags', article.tags || []] },
                        []
                      ]
                    }
                  },
                  5
                ]
              },
              // Shared related tests: 3 points per test
              {
                $multiply: [
                  {
                    $size: {
                      $ifNull: [
                        { $setIntersection: ['$relatedTests', article.relatedTests || []] },
                        []
                      ]
                    }
                  },
                  3
                ]
              }
            ]
          }
        }
      },
      { $match: { relevanceScore: { $gt: 0 } } }, // Only include articles with some relevance
      { $sort: { relevanceScore: -1, views: -1, createdAt: -1 } },
      { $limit: limit },
      {
        $project: {
          title: 1,
          slug: 1,
          category: 1,
          summary: 1,
          tags: 1,
          views: 1,
          createdAt: 1,
          updatedAt: 1,
          relevanceScore: 1
        }
      }
    ]);

    res.json({
      success: true,
      count: relatedArticles.length,
      data: relatedArticles
    });
  } catch (error) {
    console.error('Error in getRelatedArticles:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching related articles',
      error: error.message
    });
  }
};

module.exports = {
  getAllArticles,
  getArticleBySlug,
  createArticle,
  updateArticle,
  deleteArticle,
  getArticlesByCategory,
  searchArticles,
  getRelatedArticles,
  updateMediaUsageCounts
};
