const mongoose = require('mongoose');

const ArticleSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please add a title'],
      trim: true,
      maxlength: [200, 'Title cannot be more than 200 characters']
    },
    slug: {
      type: String,
      required: true,
      lowercase: true,
      trim: true
    },
    content: {
      type: String,
      required: [true, 'Please add content']
    },
    contentType: {
      type: String,
      enum: ['html', 'markdown', 'plain'],
      default: 'html'
    },
    contentMetadata: {
      wordCount: {
        type: Number,
        default: 0
      },
      readingTime: {
        type: Number, // in minutes
        default: 0
      },
      hasImages: {
        type: Boolean,
        default: false
      },
      hasTables: {
        type: Boolean,
        default: false
      },
      hasCodeBlocks: {
        type: Boolean,
        default: false
      },
      hasLatex: {
        type: Boolean,
        default: false
      }
    },
    summary: {
      type: String,
      maxlength: [500, 'Summary cannot be more than 500 characters']
    },
    category: {
      type: String,
      // REMOVED THE ENUM - Now accepts any category name
      trim: true
    },
    tags: [{
      type: String,
      lowercase: true,
      trim: true
    }],
    referenceRanges: [{
      parameter: {
        type: String,
        required: true
      },
      range: {
        type: String,
        required: true
      },
      unit: {
        type: String,
        required: true
      },
      ageGroup: {
        type: String,
        enum: ['Adult', 'Pediatric', 'Neonatal', 'Geriatric', 'All'],
        default: 'All'
      },
      notes: String
    }],
    relatedTests: [{
      type: String
    }],
    clinicalSignificance: {
      type: String
    },
    interpretation: {
      type: String
    },
    references: [{
      type: String
    }],
    images: [{
      url: {
        type: String,
        required: true
      },
      caption: String,
      alt: {
        type: String,
        required: true
      },
      width: Number,
      height: Number,
      size: Number // in bytes
    }],
    author: {
      type: String,
      // TODO: Change to ObjectId reference when User authentication is implemented
      // type: mongoose.Schema.Types.ObjectId,
      // ref: 'User'
    },
    status: {
      type: String,
      enum: ['draft', 'published', 'archived'],
      default: 'draft'
    },
    views: {
      type: Number,
      default: 0
    },
    uniqueViews: [{
      type: mongoose.Schema.Types.ObjectId
    }],
    lastViewedAt: {
      type: Date
    },
    commentCount: {
      type: Number,
      default: 0
    },
    bookmarkCount: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true
  }
);

// Pre-save hook to calculate content metadata
ArticleSchema.pre('save', function(next) {
  if (this.isModified('content')) {
    // Calculate word count
    const words = this.content.replace(/<[^>]*>/g, '').trim().split(/\s+/);
    this.contentMetadata.wordCount = words.length;
    
    // Calculate reading time (average 200 words per minute)
    this.contentMetadata.readingTime = Math.ceil(words.length / 200);
    
    // Check for images
    this.contentMetadata.hasImages = /<img/i.test(this.content);
    
    // Check for tables
    this.contentMetadata.hasTables = /<table/i.test(this.content);
    
    // Check for code blocks
    this.contentMetadata.hasCodeBlocks = /<pre|<code/i.test(this.content);
    
    // Check for LaTeX
    this.contentMetadata.hasLatex = /\$\$|\\\[|\\\(/i.test(this.content);
  }
  next();
});

// Text index for full-text search with weights
ArticleSchema.index(
  { 
    title: 'text', 
    content: 'text', 
    tags: 'text' 
  },
  { 
    weights: {
      title: 10,
      tags: 8,
      content: 5
    },
    name: 'article_text_index'
  }
);

// Other indexes for better query performance
ArticleSchema.index({ category: 1 });
ArticleSchema.index({ status: 1 });
ArticleSchema.index({ slug: 1 }, { unique: true });
ArticleSchema.index({ views: -1 });
ArticleSchema.index({ lastViewedAt: -1 });
ArticleSchema.index({ 'contentMetadata.wordCount': 1 });

module.exports = mongoose.model('Article', ArticleSchema);