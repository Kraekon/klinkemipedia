# Bookmarks & Collections API Documentation

## Overview
The Bookmarks & Collections API allows authenticated users to save articles for later reference, add personal notes, and organize bookmarks into custom collections.

## Authentication
All bookmark and collection endpoints require authentication. Include the JWT token in the `token` cookie.

## Models

### Bookmark
```javascript
{
  user: ObjectId,           // Reference to User
  article: ObjectId,        // Reference to Article
  notes: String,            // Personal notes (max 1000 chars)
  collections: [ObjectId],  // Array of Collection references
  isFavorite: Boolean,      // Favorite flag
  createdAt: Date,          // Auto-generated
  updatedAt: Date           // Auto-generated
}
```

### Collection
```javascript
{
  name: String,             // Collection name (max 100 chars)
  description: String,      // Description (max 500 chars)
  user: ObjectId,           // Reference to User
  isPublic: Boolean,        // Public visibility flag
  bookmarks: [ObjectId],    // Array of Bookmark references
  color: String,            // Hex color code (e.g., #007bff)
  icon: String,             // Emoji icon (e.g., 📚)
  createdAt: Date,          // Auto-generated
  updatedAt: Date           // Auto-generated
}
```

## Bookmark Endpoints

### Get User Bookmarks
```
GET /api/bookmarks
```

Get all bookmarks for the authenticated user with pagination and filtering.

**Query Parameters:**
- `page` (number, optional): Page number (default: 1)
- `limit` (number, optional): Results per page (default: 20, max: 100)
- `favorite` (boolean, optional): Filter by favorite status ("true" or "false")
- `collection` (string, optional): Filter by collection ID

**Response:**
```json
{
  "success": true,
  "count": 20,
  "total": 45,
  "page": 1,
  "pages": 3,
  "data": [
    {
      "_id": "...",
      "article": {
        "title": "Albumin",
        "slug": "albumin",
        "summary": "...",
        "category": "Proteins"
      },
      "notes": "Important for liver function",
      "collections": [
        {
          "name": "Liver Tests",
          "color": "#ff6b6b",
          "icon": "🔬"
        }
      ],
      "isFavorite": true,
      "createdAt": "2025-10-19T10:30:00Z"
    }
  ]
}
```

### Get Single Bookmark
```
GET /api/bookmarks/:id
```

Get details of a specific bookmark.

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "...",
    "article": { /* full article object */ },
    "notes": "...",
    "collections": [ /* collection objects */ ],
    "isFavorite": true
  }
}
```

### Create Bookmark
```
POST /api/bookmarks
Content-Type: application/json
```

Create a new bookmark for an article.

**Request Body:**
```json
{
  "articleId": "507f1f77bcf86cd799439011",
  "notes": "Review this for the exam",
  "collections": ["507f1f77bcf86cd799439012"],
  "isFavorite": false
}
```

**Response:**
```json
{
  "success": true,
  "data": { /* bookmark object */ }
}
```

**Status Codes:**
- `201`: Bookmark created successfully
- `400`: Article already bookmarked or invalid collection IDs
- `404`: Article not found

### Update Bookmark
```
PUT /api/bookmarks/:id
Content-Type: application/json
```

Update a bookmark's notes, collections, or favorite status.

**Request Body:**
```json
{
  "notes": "Updated notes",
  "collections": ["507f1f77bcf86cd799439012", "507f1f77bcf86cd799439013"],
  "isFavorite": true
}
```

**Response:**
```json
{
  "success": true,
  "data": { /* updated bookmark */ }
}
```

### Delete Bookmark
```
DELETE /api/bookmarks/:id
```

Delete a bookmark. This will also:
- Decrement the article's `bookmarkCount`
- Remove the bookmark from all collections

**Response:**
```json
{
  "success": true,
  "message": "Bookmark deleted successfully"
}
```

### Check if Article is Bookmarked
```
GET /api/bookmarks/check/:articleId
```

Check if the current user has bookmarked a specific article.

**Response:**
```json
{
  "success": true,
  "isBookmarked": true,
  "bookmark": { /* bookmark object if exists, null otherwise */ }
}
```

## Collection Endpoints

### Get User Collections
```
GET /api/collections
```

Get all collections for the authenticated user.

**Query Parameters:**
- `page` (number, optional): Page number (default: 1)
- `limit` (number, optional): Results per page (default: 20)

**Response:**
```json
{
  "success": true,
  "count": 5,
  "total": 5,
  "page": 1,
  "pages": 1,
  "data": [
    {
      "_id": "...",
      "name": "Liver Function Tests",
      "description": "All tests related to liver function",
      "isPublic": false,
      "bookmarks": [ /* populated bookmark objects */ ],
      "bookmarkCount": 8,
      "color": "#ff6b6b",
      "icon": "🔬",
      "createdAt": "2025-10-18T15:00:00Z"
    }
  ]
}
```

### Get Single Collection
```
GET /api/collections/:id
```

Get a specific collection. Public collections can be viewed by anyone; private collections only by the owner.

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "...",
    "name": "Kidney Tests",
    "description": "...",
    "user": {
      "username": "drsmith",
      "avatar": "..."
    },
    "isPublic": true,
    "bookmarks": [ /* populated bookmarks */ ],
    "color": "#4ecdc4",
    "icon": "🩺"
  }
}
```

### Create Collection
```
POST /api/collections
Content-Type: application/json
```

Create a new collection.

**Request Body:**
```json
{
  "name": "Cardiac Markers",
  "description": "Tests for heart health",
  "isPublic": false,
  "color": "#ff6b6b",
  "icon": "❤️"
}
```

**Response:**
```json
{
  "success": true,
  "data": { /* created collection */ }
}
```

**Status Codes:**
- `201`: Collection created successfully
- `400`: Collection name already exists or validation error

### Update Collection
```
PUT /api/collections/:id
Content-Type: application/json
```

Update a collection's details.

**Request Body:**
```json
{
  "name": "Updated Name",
  "description": "Updated description",
  "isPublic": true,
  "color": "#4ecdc4",
  "icon": "🩺"
}
```

**Response:**
```json
{
  "success": true,
  "data": { /* updated collection */ }
}
```

### Delete Collection
```
DELETE /api/collections/:id
```

Delete a collection. This will remove the collection reference from all associated bookmarks but will NOT delete the bookmarks themselves.

**Response:**
```json
{
  "success": true,
  "message": "Collection deleted successfully"
}
```

### Add Bookmark to Collection
```
POST /api/collections/:id/bookmarks
Content-Type: application/json
```

Add an existing bookmark to a collection.

**Request Body:**
```json
{
  "bookmarkId": "507f1f77bcf86cd799439011"
}
```

**Response:**
```json
{
  "success": true,
  "data": { /* updated collection with bookmarks */ }
}
```

### Remove Bookmark from Collection
```
DELETE /api/collections/:id/bookmarks/:bookmarkId
```

Remove a bookmark from a collection without deleting the bookmark.

**Response:**
```json
{
  "success": true,
  "data": { /* updated collection */ }
}
```

### Get Public Collections
```
GET /api/collections/public
```

Get all public collections (accessible without authentication).

**Query Parameters:**
- `page` (number, optional): Page number (default: 1)
- `limit` (number, optional): Results per page (default: 20)

**Response:**
```json
{
  "success": true,
  "count": 10,
  "total": 25,
  "page": 1,
  "pages": 3,
  "data": [ /* array of public collections */ ]
}
```

## Rate Limiting

All bookmark and collection endpoints are rate-limited to prevent abuse:
- **Limit:** 100 requests per 15 minutes
- **Response when exceeded:**
```json
{
  "message": "Too many bookmark/collection requests, please try again later"
}
```

## Error Responses

All endpoints may return the following error formats:

### 400 Bad Request
```json
{
  "success": false,
  "message": "Validation error message"
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "message": "Not authorized to access this route"
}
```

### 403 Forbidden
```json
{
  "success": false,
  "message": "Not authorized to access this bookmark/collection"
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "Bookmark/Collection not found"
}
```

### 500 Server Error
```json
{
  "success": false,
  "message": "Server error while processing request",
  "error": "Detailed error message"
}
```

## Usage Examples

### Example 1: Bookmark an Article
```javascript
// 1. Check if article is already bookmarked
const checkResponse = await fetch('/api/bookmarks/check/ARTICLE_ID', {
  credentials: 'include'
});
const { isBookmarked } = await checkResponse.json();

// 2. If not bookmarked, create bookmark
if (!isBookmarked) {
  const response = await fetch('/api/bookmarks', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({
      articleId: 'ARTICLE_ID',
      notes: 'Important for exam',
      isFavorite: true
    })
  });
}
```

### Example 2: Create Collection and Add Bookmarks
```javascript
// 1. Create a collection
const collectionResponse = await fetch('/api/collections', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  credentials: 'include',
  body: JSON.stringify({
    name: 'Study List',
    description: 'Articles to review',
    isPublic: false,
    color: '#4ecdc4',
    icon: '📚'
  })
});
const { data: collection } = await collectionResponse.json();

// 2. Add bookmark to collection
await fetch(`/api/collections/${collection._id}/bookmarks`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  credentials: 'include',
  body: JSON.stringify({
    bookmarkId: 'BOOKMARK_ID'
  })
});
```

### Example 3: Get Favorite Bookmarks in a Collection
```javascript
// Get all favorite bookmarks in a specific collection
const response = await fetch(
  '/api/bookmarks?favorite=true&collection=COLLECTION_ID',
  { credentials: 'include' }
);
const { data: bookmarks } = await response.json();
```

## Article Model Updates

The Article model has been updated with a new field:

```javascript
{
  // ... existing fields
  bookmarkCount: {
    type: Number,
    default: 0
  }
}
```

This field is automatically updated when bookmarks are created or deleted.

## Notes

1. **Unique Constraint:** A user can only bookmark an article once. Attempting to create a duplicate bookmark will return a 400 error.

2. **Cascade Operations:** 
   - Deleting a bookmark removes it from all collections and decrements the article's bookmark count
   - Deleting a collection removes it from all bookmarks but keeps the bookmarks themselves

3. **Access Control:**
   - Users can only view, edit, or delete their own bookmarks and private collections
   - Public collections can be viewed by anyone but only modified by the owner

4. **Performance:** All queries use MongoDB indexes for optimal performance with large datasets.

5. **Validation:**
   - Collection names must be unique per user
   - Color codes must be valid 6-digit hex colors (e.g., #ff6b6b)
   - Notes are limited to 1000 characters
   - Collection names are limited to 100 characters
   - Collection descriptions are limited to 500 characters
