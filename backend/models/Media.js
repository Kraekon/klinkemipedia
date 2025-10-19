const mongoose = require('mongoose');

const MediaSchema = new mongoose.Schema(
  {
    filename: {
      type: String,
      required: [true, 'Filename is required'],
      unique: true,
      trim: true
    },
    originalName: {
      type: String,
      required: [true, 'Original name is required'],
      trim: true
    },
    mimeType: {
      type: String,
      required: [true, 'MIME type is required']
    },
    size: {
      type: Number,
      required: [true, 'File size is required']
    },
    width: {
      type: Number
    },
    height: {
      type: Number
    },
    url: {
      type: String,
      required: [true, 'URL is required']
    },
    uploadedBy: {
      type: String,
      default: 'admin'
    },
    uploadedAt: {
      type: Date,
      default: Date.now
    },
    usageCount: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true
  }
);

// Indexes for better query performance
MediaSchema.index({ filename: 1 }, { unique: true });
MediaSchema.index({ uploadedAt: -1 });
MediaSchema.index({ usageCount: 1 });

module.exports = mongoose.model('Media', MediaSchema);
