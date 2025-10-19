const mongoose = require('mongoose');

const ArticleRevisionSchema = new mongoose.Schema(
  {
    articleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Article',
      required: true,
      index: true
    },
    versionNumber: {
      type: Number,
      required: true,
      min: 1
    },
    title: {
      type: String,
      required: true,
      trim: true
    },
    slug: {
      type: String,
      required: true,
      lowercase: true,
      trim: true
    },
    content: {
      type: String,
      required: true
    },
    summary: {
      type: String
    },
    category: {
      type: String,
      enum: [
        'Electrolytes',
        'Liver Function',
        'Kidney Function',
        'Cardiac Markers',
        'Hormones',
        'Enzymes',
        'Hematology',
        'Lipid Panel',
        'Other'
      ]
    },
    tags: [{
      type: String,
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
    clinicalSignificance: {
      type: String
    },
    interpretation: {
      type: String
    },
    relatedTests: [{
      type: String
    }],
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
      }
    }],
    status: {
      type: String,
      enum: ['draft', 'published', 'archived'],
      default: 'draft'
    },
    editedBy: {
      type: String,
      default: 'admin'
    },
    changeDescription: {
      type: String,
      default: ''
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true
    }
  },
  {
    timestamps: false // Using custom timestamp field
  }
);

// Compound index for efficient querying
ArticleRevisionSchema.index({ articleId: 1, versionNumber: 1 }, { unique: true });
ArticleRevisionSchema.index({ articleId: 1, timestamp: -1 });

/**
 * Static method to get next version number for an article
 */
ArticleRevisionSchema.statics.getNextVersionNumber = async function(articleId) {
  const latestRevision = await this.findOne({ articleId })
    .sort({ versionNumber: -1 })
    .select('versionNumber')
    .lean();
  
  return latestRevision ? latestRevision.versionNumber + 1 : 1;
};

/**
 * Static method to create a revision from an article
 */
ArticleRevisionSchema.statics.createFromArticle = async function(article, editedBy = 'admin', changeDescription = '') {
  const versionNumber = await this.getNextVersionNumber(article._id);
  
  const revision = new this({
    articleId: article._id,
    versionNumber,
    title: article.title,
    slug: article.slug,
    content: article.content,
    summary: article.summary,
    category: article.category,
    tags: article.tags || [],
    referenceRanges: article.referenceRanges || [],
    clinicalSignificance: article.clinicalSignificance,
    interpretation: article.interpretation,
    relatedTests: article.relatedTests || [],
    references: article.references || [],
    images: article.images || [],
    status: article.status,
    editedBy,
    changeDescription
  });
  
  return revision.save();
};

module.exports = mongoose.model('ArticleRevision', ArticleRevisionSchema);
