# Image Storage Migration Guide

This guide explains how to migrate from local file system storage to cloud storage providers (Cloudinary, AWS S3, etc.).

## Architecture Overview

The image storage system in Klinkemipedia uses an abstraction layer that allows you to swap storage implementations without changing any API code. The abstraction is implemented in `backend/utils/imageStorage.js`.

### Interface

All storage implementations must provide these methods:

```javascript
class ImageStorage {
  async upload(file) {
    // Upload the file and return metadata
    // Returns: { url, filename, originalName, size, mimetype }
  }
  
  async delete(filename) {
    // Delete the file
    // Returns: { success, message }
  }
  
  getPublicUrl(filename) {
    // Get the public URL for accessing the file
    // Returns: string (URL)
  }
  
  getMulterStorage() {
    // Get multer storage configuration
    // Returns: multer storage object
  }
}
```

## Current Implementation: Local File System

**Location**: `backend/utils/imageStorage.js` → `LocalFileStorage` class

### How It Works

1. Images are stored in `backend/public/uploads/`
2. Filenames are generated with timestamp prefix: `1234567890-originalname.jpg`
3. Files are served via Express static middleware: `/uploads/filename.jpg`
4. Security: Filenames are sanitized to prevent path traversal attacks

### Configuration

No configuration needed. Images are automatically stored locally.

### Pros & Cons

**Pros:**
- No external dependencies
- No additional costs
- Fast for development
- Full control over files

**Cons:**
- Does not scale for production
- No CDN support
- Requires backups
- Single point of failure

---

## Migration Option 1: Cloudinary

Cloudinary is a cloud-based image and video management service with built-in CDN.

### Prerequisites

1. Create a free account at [Cloudinary](https://cloudinary.com/)
2. Get your credentials from the Cloudinary dashboard:
   - Cloud Name
   - API Key
   - API Secret

### Steps

#### 1. Configure Environment Variables

Add to `backend/.env`:

```bash
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

#### 2. Update Storage Configuration

In `backend/utils/imageStorage.js`:

1. **Uncomment** the `CloudinaryImageStorage` class (lines 129-180)
2. **Update** the storage export at the bottom:

```javascript
// Change from:
const storage = new LocalFileStorage();

// To:
const storage = new CloudinaryImageStorage();

module.exports = storage;
```

#### 3. Restart Server

```bash
npm run server
```

That's it! All upload endpoints will now use Cloudinary automatically.

### Features with Cloudinary

- **CDN**: Images served from global CDN
- **Transformations**: Automatic image optimization, resizing, cropping
- **Format Conversion**: Automatic format conversion (WebP, AVIF)
- **Backup**: Automatic backups and redundancy
- **Analytics**: Usage analytics and insights

### Cloudinary Configuration Options

You can customize the Cloudinary storage in `imageStorage.js`:

```javascript
this.storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'klinkemipedia',           // Folder name in Cloudinary
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
    transformation: [
      { width: 1000, height: 1000, crop: 'limit' }  // Max dimensions
    ],
    resource_type: 'image',             // Type of resource
    public_id: (req, file) => {         // Custom naming
      return `article-${Date.now()}`;
    }
  }
});
```

### Migrating Existing Images

If you have existing images in `backend/public/uploads/`, you can migrate them:

1. **Manual Upload**: Upload images to Cloudinary via their dashboard
2. **Programmatic Upload**: Use Cloudinary's Node.js SDK:

```javascript
const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const path = require('path');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

async function migrateImages() {
  const uploadsDir = path.join(__dirname, 'backend/public/uploads');
  const files = fs.readdirSync(uploadsDir);
  
  for (const file of files) {
    if (file === '.gitkeep') continue;
    
    const filePath = path.join(uploadsDir, file);
    const result = await cloudinary.uploader.upload(filePath, {
      folder: 'klinkemipedia',
      public_id: path.basename(file, path.extname(file))
    });
    
    console.log(`Migrated: ${file} -> ${result.secure_url}`);
  }
}

migrateImages().catch(console.error);
```

3. **Update Database**: Update article image URLs in MongoDB to use new Cloudinary URLs

---

## Migration Option 2: AWS S3

Amazon S3 is a highly scalable object storage service.

### Prerequisites

1. Create an AWS account
2. Create an S3 bucket
3. Get AWS access credentials (Access Key ID and Secret Access Key)
4. Configure bucket permissions (make images publicly readable or use signed URLs)

### Steps

#### 1. Install Dependencies

```bash
npm install aws-sdk multer-s3
```

#### 2. Configure Environment Variables

Add to `backend/.env`:

```bash
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_REGION=us-east-1
AWS_S3_BUCKET=your-bucket-name
```

#### 3. Implement S3 Storage Class

Add to `backend/utils/imageStorage.js`:

```javascript
const AWS = require('aws-sdk');
const multerS3 = require('multer-s3');

class S3ImageStorage extends ImageStorage {
  constructor() {
    super();
    
    // Configure AWS
    AWS.config.update({
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      region: process.env.AWS_REGION
    });
    
    this.s3 = new AWS.S3();
    this.bucket = process.env.AWS_S3_BUCKET;
  }

  getMulterStorage() {
    return multerS3({
      s3: this.s3,
      bucket: this.bucket,
      acl: 'public-read',
      metadata: (req, file, cb) => {
        cb(null, { fieldName: file.fieldname });
      },
      key: (req, file, cb) => {
        const timestamp = Date.now();
        const ext = path.extname(file.originalname);
        const nameWithoutExt = path.basename(file.originalname, ext);
        const safeName = nameWithoutExt.replace(/[^a-z0-9_-]/gi, '_');
        cb(null, `klinkemipedia/${timestamp}-${safeName}${ext}`);
      }
    });
  }

  async upload(file) {
    return {
      url: file.location,  // S3 URL
      filename: file.key,
      originalName: file.originalname,
      size: file.size,
      mimetype: file.mimetype
    };
  }

  async delete(filename) {
    try {
      await this.s3.deleteObject({
        Bucket: this.bucket,
        Key: filename
      }).promise();
      
      return { success: true, message: 'File deleted successfully' };
    } catch (error) {
      throw error;
    }
  }

  getPublicUrl(filename) {
    return `https://${this.bucket}.s3.${process.env.AWS_REGION}.amazonaws.com/${filename}`;
  }
}
```

#### 4. Update Storage Export

```javascript
const storage = new S3ImageStorage();
module.exports = storage;
```

#### 5. Restart Server

```bash
npm run server
```

### S3 Configuration Options

- **Bucket Policies**: Configure public read access or use CloudFront
- **Lifecycle Rules**: Auto-delete old images or transition to cheaper storage
- **Versioning**: Enable versioning for image backups
- **CloudFront**: Add CDN for faster global delivery

---

## Migration Option 3: Other Providers

You can implement storage for any provider by creating a new class that extends `ImageStorage`:

### Example: Custom Provider

```javascript
class CustomImageStorage extends ImageStorage {
  constructor() {
    super();
    // Initialize your storage provider
  }

  getMulterStorage() {
    // Return multer storage configuration
  }

  async upload(file) {
    // Upload logic
    return { url, filename, originalName, size, mimetype };
  }

  async delete(filename) {
    // Delete logic
    return { success, message };
  }

  getPublicUrl(filename) {
    // Return public URL
    return url;
  }
}

const storage = new CustomImageStorage();
module.exports = storage;
```

### Supported Providers

Popular providers you can implement:
- **Cloudflare R2**: S3-compatible, zero egress fees
- **DigitalOcean Spaces**: S3-compatible with CDN
- **Google Cloud Storage**: Scalable cloud storage
- **Azure Blob Storage**: Microsoft's cloud storage
- **Backblaze B2**: Affordable cloud storage

---

## Testing After Migration

After switching storage providers:

1. **Test Upload**:
   ```bash
   curl -X POST http://localhost:5001/api/articles/upload \
     -F "image=@test-image.jpg"
   ```

2. **Verify URL**: Check the returned `imageUrl` is accessible

3. **Test in UI**: 
   - Create/edit an article
   - Upload an image
   - Verify it displays correctly

4. **Test Delete** (if implemented):
   - Delete an article with images
   - Verify images are removed from storage

---

## Rollback Plan

If you need to rollback to local storage:

1. Change storage export back to:
   ```javascript
   const storage = new LocalFileStorage();
   ```

2. Restart server

3. Existing Cloudinary/S3 images will still work (URLs are absolute)

---

## Best Practices

1. **Environment Variables**: Always use environment variables for credentials
2. **Backups**: Regularly backup your cloud storage
3. **Monitoring**: Monitor storage usage and costs
4. **Security**: Never commit credentials to version control
5. **Testing**: Test uploads in staging before production
6. **Optimization**: Use image transformations to reduce bandwidth
7. **CDN**: Use CDN for faster global delivery

---

## Troubleshooting

### Issue: Images not uploading to Cloudinary

**Solution**: Check environment variables are set correctly:
```bash
echo $CLOUDINARY_CLOUD_NAME
echo $CLOUDINARY_API_KEY
```

### Issue: S3 403 Forbidden

**Solution**: Check bucket permissions and IAM user permissions. Ensure `public-read` ACL is allowed.

### Issue: Images not displaying after migration

**Solution**: Image URLs in database still point to old location. Update URLs in MongoDB or serve old images from original location.

### Issue: CORS errors

**Solution**: Configure CORS on your cloud storage provider to allow requests from your frontend domain.

---

## Cost Comparison

### Cloudinary
- **Free Tier**: 25 GB storage, 25 GB bandwidth/month
- **Paid**: Starts at $89/month

### AWS S3
- **Storage**: $0.023 per GB/month
- **Transfer**: $0.09 per GB (first 10 TB)
- **Requests**: $0.005 per 1,000 PUT requests

### Local Storage
- **Cost**: Server disk space
- **Scaling**: Limited by server capacity

Choose based on your traffic, storage needs, and budget.

---

## Support

For issues or questions:
1. Check the error logs: `npm run server`
2. Review environment variables
3. Test with provider's dashboard/tools
4. Open an issue on GitHub

---

## Related Documentation

- [README.md](../README.md) - Main documentation
- [Multer Documentation](https://github.com/expressjs/multer)
- [Cloudinary Node.js SDK](https://cloudinary.com/documentation/node_integration)
- [AWS S3 SDK](https://docs.aws.amazon.com/sdk-for-javascript/v2/developer-guide/s3-examples.html)
