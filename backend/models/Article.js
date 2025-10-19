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
    summary: {
      type: String,
      maxlength: [500, 'Summary cannot be more than 500 characters']
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
      }
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
    }
  },
  {
    timestamps: true
  }
);

// Index for better search performance
ArticleSchema.index({ title: 'text', content: 'text', tags: 'text' });
ArticleSchema.index({ category: 1 });
ArticleSchema.index({ status: 1 });
ArticleSchema.index({ slug: 1 }, { unique: true });

module.exports = mongoose.model('Article', ArticleSchema);
