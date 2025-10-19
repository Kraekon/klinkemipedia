const mongoose = require('mongoose');

const draftSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  article: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Article',
    default: null // null = new article draft
  },
  title: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  contentType: {
    type: String,
    enum: ['html', 'markdown'],
    default: 'html'
  },
  tags: [String],
  category: String,
  metadata: {
    wordCount: Number,
    lastCursorPosition: Number,
    editorMode: String // 'wysiwyg', 'markdown', 'split'
  },
  autoSaved: {
    type: Boolean,
    default: true
  },
  lastSavedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for faster lookups
draftSchema.index({ user: 1, article: 1 });
draftSchema.index({ updatedAt: -1 });

// Auto-delete drafts older than 30 days
draftSchema.index({ updatedAt: 1 }, { expireAfterSeconds: 2592000 });

module.exports = mongoose.model('Draft', draftSchema);
