# Media Library Backend Implementation

## Overview

This document describes the complete implementation of the Media Library backend functionality for the Klinkemipedia admin panel.

## Implemented Endpoints

### 1. POST /api/media/upload
**Purpose:** Upload and optimize images

**Authentication:** Required (`protect` middleware)

**Request:**
- Method: POST
- Content-Type: multipart/form-data
- Body: `image` (file)

**Response:**
```json
{
  "success": true,
  "data": {
    "filename": "optimized-image-1234567890-123456789.jpg",
    "url": "/uploads/images/optimized-image-1234567890-123456789.jpg",
    "originalName": "my-image.jpg",
    "size": 12345,
    "width": 800,
    "height": 600
  },
  "message": "Image uploaded and optimized successfully"
}
```

**Features:**
- Accepts JPEG, JPG, PNG, GIF, WEBP formats
- Maximum file size: 5MB
- Automatically optimizes images (max 1200x1200, 85% JPEG quality)
- Saves metadata to MongoDB Media model
- Stores files in `uploads/images/` directory

---

### 2. GET /api/media
**Purpose:** List all media files with pagination, filtering, and sorting

**Authentication:** Required (`protect` middleware)

**Query Parameters:**
- `page` (number, default: 1) - Page number
- `limit` (number, default: 20) - Items per page
- `sort` (string, default: 'date') - Sort field: 'date', 'size', 'name'
- `order` (string, default: 'desc') - Sort order: 'asc', 'desc'
- `filter` (string, default: 'all') - Filter: 'all', 'used', 'unused'
- `search` (string) - Search by filename

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "64a1b2c3d4e5f6g7h8i9j0k1",
      "filename": "optimized-image-123.jpg",
      "originalName": "my-image.jpg",
      "url": "/uploads/images/optimized-image-123.jpg",
      "size": 12345,
      "width": 800,
      "height": 600,
      "mimeType": "image/jpeg",
      "uploadedBy": "admin",
      "uploadedAt": "2024-01-15T10:30:00.000Z",
      "usageCount": 2
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 45,
    "pages": 3
  },
  "stats": {
    "totalImages": 45,
    "totalSize": 5242880,
    "usedImages": 30,
    "unusedImages": 15
  }
}
```

**Features:**
- Scans file system for images in `uploads/images/`
- Merges file system data with database records
- Calculates usage count by scanning article content
- Supports pagination for efficient loading
- Provides comprehensive statistics

---

### 3. GET /api/media/:filename/usage
**Purpose:** Get usage information for a specific image

**Authentication:** Required (`protect` middleware)

**Parameters:**
- `filename` (string) - The image filename

**Response:**
```json
{
  "success": true,
  "data": {
    "usageCount": 2,
    "articles": [
      {
        "title": "Sodium Levels in Blood",
        "slug": "sodium-levels",
        "_id": "64a1b2c3d4e5f6g7h8i9j0k1"
      },
      {
        "title": "Electrolyte Balance",
        "slug": "electrolyte-balance",
        "_id": "64a1b2c3d4e5f6g7h8i9j0k2"
      }
    ]
  }
}
```

**Features:**
- Scans all non-archived articles for image references
- Checks both article content and images array
- Returns list of articles using the image

---

### 4. DELETE /api/media/:filename
**Purpose:** Delete an image from the system

**Authentication:** Required (`protect` middleware)

**Parameters:**
- `filename` (string) - The image filename

**Query Parameters:**
- `force` (boolean, default: false) - Delete even if used in articles

**Response (Success):**
```json
{
  "success": true,
  "message": "Image deleted successfully",
  "deletedFile": "optimized-image-123.jpg"
}
```

**Response (Error - Image in use):**
```json
{
  "success": false,
  "message": "Cannot delete image. It is used in 2 article(s). Use force=true to delete anyway.",
  "usageCount": 2,
  "articles": [
    {
      "title": "Sodium Levels",
      "slug": "sodium-levels",
      "_id": "..."
    }
  ]
}
```

**Features:**
- Checks if file exists before deletion
- Validates usage in articles
- Prevents deletion if image is in use (unless force=true)
- Deletes from both file system and database
- Sanitizes filename to prevent path traversal

---

### 5. GET /api/media/analytics
**Purpose:** Get comprehensive analytics about media library

**Authentication:** Required (`protect` middleware)

**Response:**
```json
{
  "success": true,
  "data": {
    "totalImages": 45,
    "totalSize": 5242880,
    "usedImages": 30,
    "unusedImages": 15,
    "mostUsed": [
      {
        "filename": "optimized-image-123.jpg",
        "url": "/uploads/images/optimized-image-123.jpg",
        "size": 12345,
        "usageCount": 5,
        "articles": [...]
      }
    ],
    "largest": [
      {
        "filename": "optimized-image-456.jpg",
        "url": "/uploads/images/optimized-image-456.jpg",
        "size": 987654,
        "usageCount": 2,
        "articles": [...]
      }
    ],
    "unusedImages": [
      {
        "filename": "optimized-image-789.jpg",
        "url": "/uploads/images/optimized-image-789.jpg",
        "size": 54321
      }
    ]
  }
}
```

**Features:**
- Returns top 10 most used images
- Returns top 10 largest images
- Lists all unused images
- Provides overall statistics

---

### 6. DELETE /api/media/bulk
**Purpose:** Bulk delete multiple images

**Authentication:** Required (`protect` middleware)

**Request Body:**
```json
{
  "imageIds": ["64a1b2c3d4e5f6g7h8i9j0k1", "filename2.jpg", "filename3.jpg"]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Bulk delete completed. Deleted: 2, Skipped: 1, Failed: 0",
  "results": {
    "deleted": [
      { "imageId": "filename2.jpg", "filename": "filename2.jpg" }
    ],
    "skipped": [
      {
        "imageId": "filename1.jpg",
        "filename": "filename1.jpg",
        "reason": "Used in 2 article(s)",
        "articles": [...]
      }
    ],
    "failed": []
  }
}
```

**Features:**
- Accepts array of image IDs or filenames
- Skips images that are in use
- Returns detailed results for each image
- Only deletes unused images by default

---

## Security Features

### Authentication
- All endpoints require JWT authentication via `protect` middleware
- User must be logged in to access any media operations

### Path Traversal Prevention
- Filenames are sanitized using `path.basename()`
- Prevents directory traversal attacks (e.g., `../../etc/passwd`)

### Input Validation
- File type validation (only image formats allowed)
- File size limits (5MB maximum)
- Query parameter validation

### Error Handling
- Comprehensive error messages
- Proper HTTP status codes
- Try-catch blocks for all operations
- Database errors don't expose sensitive information

### Security Considerations (from CodeQL)

**Rate Limiting:**
- These routes perform expensive operations (database queries, file system access)
- Recommendation: Implement rate limiting at the application level
- Consider using `express-rate-limit` middleware in production

**CSRF Protection:**
- Authentication uses JWT tokens in httpOnly cookies
- Current implementation has basic CSRF protection through same-origin cookies
- Recommendation: Consider implementing explicit CSRF tokens for additional security

**False Positive - SQL Injection:**
- CodeQL may flag MongoDB queries as potential SQL injection
- These are false positives - MongoDB with Mongoose is not vulnerable to SQL injection
- All queries use MongoDB's query syntax with proper parameterization

---

## File System Operations

### Upload Directory
- Location: `uploads/images/` (at project root)
- Created automatically if it doesn't exist
- Added to `.gitignore` to prevent committing uploaded files
- `.gitkeep` file preserves directory structure in git

### File Synchronization
- Scans file system for actual files
- Merges with database records
- Handles cases where:
  - File exists but not in database (legacy files)
  - Database record exists but file is missing (shows as missing)
  - Both exist (normal case)

---

## Usage Tracking

### How it Works
1. Scans all non-archived articles
2. Checks article `content` field for image URL
3. Checks article `images` array for image references
4. Returns count and list of articles using the image

### Performance Considerations
- Usage tracking scans all articles on each request
- Consider implementing caching for production use
- Could add a background job to pre-calculate usage counts

---

## Integration with Frontend

The frontend `AdminMediaLibrary` component expects:

### API Calls
```javascript
// List media
getAllMedia({ page: 1, limit: 20, sort: 'date', order: 'desc', filter: 'all' })

// Get usage
getMediaUsage(filename)

// Delete image
deleteMedia(filename, force)

// Get analytics
getMediaAnalytics()

// Bulk delete
bulkDeleteMedia([imageId1, imageId2, ...])
```

### Response Format
- Success responses: `{ success: true, data: {...}, ... }`
- Error responses: `{ success: false, message: "...", error: "..." }`
- Statistics included in list response
- Pagination info included in list response

---

## Testing

### Manual Testing
```bash
# List media
curl -X GET http://localhost:5001/api/media?page=1&limit=20 \
  -H "Cookie: token=YOUR_JWT_TOKEN"

# Get usage
curl -X GET http://localhost:5001/api/media/image-123.jpg/usage \
  -H "Cookie: token=YOUR_JWT_TOKEN"

# Delete image
curl -X DELETE http://localhost:5001/api/media/image-123.jpg?force=false \
  -H "Cookie: token=YOUR_JWT_TOKEN"

# Get analytics
curl -X GET http://localhost:5001/api/media/analytics \
  -H "Cookie: token=YOUR_JWT_TOKEN"

# Bulk delete
curl -X DELETE http://localhost:5001/api/media/bulk \
  -H "Cookie: token=YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"imageIds": ["id1", "id2"]}'
```

### Unit Test Structure
```javascript
describe('Media Routes', () => {
  it('should list media with pagination')
  it('should filter used/unused images')
  it('should sort by date/size/name')
  it('should get image usage')
  it('should delete unused image')
  it('should prevent deletion of used image')
  it('should force delete used image')
  it('should return analytics')
  it('should bulk delete images')
})
```

---

## Future Improvements

### Performance
- Add caching for usage counts
- Implement background job for usage calculation
- Add database indexes for better query performance

### Features
- Image resizing with multiple sizes (thumbnail, medium, large)
- Automatic image optimization on upload
- Support for other file types (PDF, video)
- Image cropping and editing
- Duplicate detection
- Cloud storage integration (S3, Cloudinary)

### Security
- Add rate limiting middleware
- Implement explicit CSRF tokens
- Add audit logging for all operations
- Add file virus scanning
- Add watermarking for copyrighted images

---

## Troubleshooting

### Images not showing
- Check if file exists in `uploads/images/` directory
- Verify file permissions
- Check if static file serving is configured in server.js
- Verify URL paths match between upload and retrieval

### Database sync issues
- Run migration script to sync file system with database
- Check for orphaned database records
- Check for orphaned files

### Performance issues
- Implement caching for statistics
- Add database indexes
- Consider pagination limits
- Implement background jobs for heavy operations

---

## Conclusion

The Media Library backend is now fully functional with:
- ✅ Complete CRUD operations for media files
- ✅ Usage tracking in articles
- ✅ Pagination and filtering
- ✅ Comprehensive statistics
- ✅ Security features (authentication, path validation)
- ✅ Error handling
- ✅ Integration with existing frontend

The implementation is ready for production use with the noted security recommendations.
