const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;

/**
 * Abstract Image Storage Interface
 * This abstraction allows easy switching between local file system and cloud storage (Cloudinary, S3, etc.)
 * 
 * To switch to cloud storage:
 * 1. Implement a new CloudinaryStorage or S3Storage class that extends ImageStorage
 * 2. Update the storage initialization at the bottom of this file
 * 3. All API endpoints will continue working without changes
 */
class ImageStorage {
  async upload(file) {
    throw new Error('upload() must be implemented by subclass');
  }
  
  async delete(filename) {
    throw new Error('delete() must be implemented by subclass');
  }
  
  getPublicUrl(filename) {
    throw new Error('getPublicUrl() must be implemented by subclass');
  }
  
  getMulterStorage() {
    throw new Error('getMulterStorage() must be implemented by subclass');
  }
}

/**
 * Local File System Storage Implementation
 * Stores images in backend/public/uploads/ directory
 */
class LocalFileStorage extends ImageStorage {
  constructor() {
    super();
    this.uploadDir = path.join(__dirname, '..', 'public', 'uploads');
    this.baseUrl = '/uploads'; // URL path for serving static files
  }

  /**
   * Generate unique filename with timestamp
   */
  generateFilename(originalName) {
    const timestamp = Date.now();
    const ext = path.extname(originalName);
    const nameWithoutExt = path.basename(originalName, ext);
    // Sanitize filename to prevent path traversal
    const safeName = nameWithoutExt.replace(/[^a-z0-9_-]/gi, '_');
    return `${timestamp}-${safeName}${ext}`;
  }

  /**
   * Get multer storage configuration
   */
  getMulterStorage() {
    return multer.diskStorage({
      destination: async (req, file, cb) => {
        try {
          // Ensure upload directory exists
          await fs.mkdir(this.uploadDir, { recursive: true });
          cb(null, this.uploadDir);
        } catch (error) {
          cb(error, null);
        }
      },
      filename: (req, file, cb) => {
        const filename = this.generateFilename(file.originalname);
        cb(null, filename);
      }
    });
  }

  /**
   * Upload file (called after multer processes the file)
   * Returns metadata about the uploaded file
   */
  async upload(file) {
    return {
      url: this.getPublicUrl(file.filename),
      filename: file.filename,
      originalName: file.originalname,
      size: file.size,
      mimetype: file.mimetype
    };
  }

  /**
   * Delete file from storage
   */
  async delete(filename) {
    const filePath = path.join(this.uploadDir, filename);
    try {
      await fs.unlink(filePath);
      return { success: true, message: 'File deleted successfully' };
    } catch (error) {
      if (error.code === 'ENOENT') {
        return { success: false, message: 'File not found' };
      }
      throw error;
    }
  }

  /**
   * Get public URL for accessing the file
   */
  getPublicUrl(filename) {
    return `${this.baseUrl}/${filename}`;
  }
}

/**
 * Cloudinary Storage Implementation
 * Handles cloud-based image storage with automatic optimization
 */
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

class CloudinaryImageStorage extends ImageStorage {
  constructor() {
    super();
    // Configure Cloudinary
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET
    });
    
    this.cloudinary = cloudinary;
    this.storage = new CloudinaryStorage({
      cloudinary: cloudinary,
      params: {
        folder: 'klinkemipedia',
        allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
        // Image optimization with Cloudinary transformations
        transformation: [
          { width: 1200, height: 1200, crop: 'limit' },
          { quality: 'auto:good', fetch_format: 'auto' }
        ]
      }
    });
  }

  getMulterStorage() {
    return this.storage;
  }

  async upload(file) {
    // Extract public_id from the filename for future deletion
    const publicId = file.filename;
    return {
      url: file.path, // Cloudinary URL
      filename: publicId,
      originalName: file.originalname,
      size: file.size,
      mimetype: file.mimetype
    };
  }

  async delete(publicId) {
    try {
      // Extract the public_id without folder prefix if needed
      const result = await this.cloudinary.uploader.destroy(publicId);
      if (result.result === 'ok' || result.result === 'not found') {
        return { success: true, message: 'File deleted successfully' };
      }
      return { success: false, message: 'Failed to delete file' };
    } catch (error) {
      throw error;
    }
  }

  getPublicUrl(filename) {
    return filename; // Cloudinary returns full URL
  }
}

/**
 * Storage Factory
 * Uses Cloudinary for cloud-based image storage with automatic optimization
 */
const storage = new CloudinaryImageStorage();

module.exports = storage;
