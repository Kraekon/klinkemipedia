const mongoose = require('mongoose');

const SearchSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    query: {
      type: String,
      required: true,
      trim: true
    },
    resultsCount: {
      type: Number,
      default: 0
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: false // We only need createdAt
  }
);

// Index for better query performance
SearchSchema.index({ createdAt: -1 });
SearchSchema.index({ userId: 1, createdAt: -1 });
SearchSchema.index({ query: 1 });

// TTL index to automatically delete searches older than 30 days
SearchSchema.index({ createdAt: 1 }, { expireAfterSeconds: 2592000 }); // 30 days

module.exports = mongoose.model('Search', SearchSchema);
