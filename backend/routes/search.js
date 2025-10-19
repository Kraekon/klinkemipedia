const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const Article = require('../models/Article');
const Search = require('../models/Search');
const { protect } = require('../middleware/auth');

// Rate limiting for search API - 60 requests per minute
const searchLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 60,
  message: 'Too many search requests, please try again later.'
});

// Helper function to sanitize search query
const sanitizeQuery = (query) => {
  if (!query) return '';
  // Remove special regex characters and MongoDB operators
  return query
    .trim()
    .replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    .replace(/\$/g, '')
    .substring(0, 200); // Limit query length
};

// Helper function to highlight matching text
const highlightMatches = (text, query) => {
  if (!text || !query) return text;
  const regex = new RegExp(`(${query})`, 'gi');
  return text.replace(regex, '<mark>$1</mark>');
};

// @desc    Full-text search with filters
// @route   GET /api/search?q=query&tags=tag1,tag2&author=username&sort=relevance|date|popularity&page=1&limit=20
// @access  Public
router.get('/', searchLimiter, async (req, res) => {
  try {
    const {
      q: rawQuery,
      tags,
      author,
      sort = 'relevance',
      page = 1,
      limit = 20
    } = req.query;

    if (!rawQuery) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required'
      });
    }

    const query = sanitizeQuery(rawQuery);
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
    const skip = (pageNum - 1) * limitNum;

    // Build search filter
    const filter = {
      status: 'published',
      $text: { $search: query }
    };

    // Add tag filter
    if (tags) {
      const tagArray = tags.split(',').map(t => t.trim().toLowerCase());
      filter.tags = { $in: tagArray };
    }

    // Add author filter
    if (author) {
      filter.author = author.trim();
    }

    // Build sort options
    let sortOptions = {};
    switch (sort) {
      case 'date':
        sortOptions = { createdAt: -1 };
        break;
      case 'popularity':
        sortOptions = { views: -1 };
        break;
      case 'relevance':
      default:
        sortOptions = { score: { $meta: 'textScore' } };
        break;
    }

    // Execute search
    const articles = await Article.find(
      filter,
      { score: { $meta: 'textScore' } }
    )
      .sort(sortOptions)
      .skip(skip)
      .limit(limitNum)
      .select('title slug summary category tags author views createdAt');

    const total = await Article.countDocuments(filter);

    // Track search
    const userId = req.user ? req.user.id : null;
    await Search.create({
      userId,
      query: rawQuery,
      resultsCount: total
    });

    // Highlight matches in results (optional, can be heavy)
    const highlightedArticles = articles.map(article => ({
      ...article.toObject(),
      highlightedTitle: highlightMatches(article.title, query),
      highlightedSummary: article.summary ? highlightMatches(article.summary, query) : null
    }));

    res.json({
      success: true,
      query: rawQuery,
      count: articles.length,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum),
      data: highlightedArticles
    });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({
      success: false,
      message: 'Error performing search',
      error: error.message
    });
  }
});

// @desc    Autocomplete suggestions
// @route   GET /api/search/suggestions?q=partial
// @access  Public
router.get('/suggestions', searchLimiter, async (req, res) => {
  try {
    const { q: rawQuery } = req.query;

    if (!rawQuery || rawQuery.length < 2) {
      return res.json({
        success: true,
        data: []
      });
    }

    const query = sanitizeQuery(rawQuery);

    // Search for articles with titles starting with or containing the query
    const articles = await Article.find({
      status: 'published',
      title: { $regex: query, $options: 'i' }
    })
      .select('title slug')
      .limit(5)
      .sort({ views: -1 }); // Prioritize popular articles

    res.json({
      success: true,
      data: articles
    });
  } catch (error) {
    console.error('Suggestions error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching suggestions',
      error: error.message
    });
  }
});

// @desc    Get user's recent searches
// @route   GET /api/search/history
// @access  Private
router.get('/history', protect, async (req, res) => {
  try {
    const searches = await Search.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .limit(20)
      .select('query resultsCount createdAt');

    res.json({
      success: true,
      data: searches
    });
  } catch (error) {
    console.error('Search history error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching search history',
      error: error.message
    });
  }
});

// @desc    Get most popular searches
// @route   GET /api/search/popular
// @access  Public
router.get('/popular', async (req, res) => {
  try {
    // Get searches from last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const popularSearches = await Search.aggregate([
      {
        $match: {
          createdAt: { $gte: thirtyDaysAgo }
        }
      },
      {
        $group: {
          _id: '$query',
          count: { $sum: 1 },
          avgResults: { $avg: '$resultsCount' }
        }
      },
      {
        $match: {
          avgResults: { $gt: 0 } // Only include searches that returned results
        }
      },
      {
        $sort: { count: -1 }
      },
      {
        $limit: 10
      },
      {
        $project: {
          query: '$_id',
          count: 1,
          _id: 0
        }
      }
    ]);

    res.json({
      success: true,
      data: popularSearches
    });
  } catch (error) {
    console.error('Popular searches error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching popular searches',
      error: error.message
    });
  }
});

module.exports = router;
