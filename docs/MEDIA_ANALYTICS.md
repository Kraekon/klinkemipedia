# Media Analytics - Phase 3 Implementation

## Overview

This document describes the Media Analytics feature added in Phase 3, which provides comprehensive analytics and usage tracking for the Media Library.

## Features

### 1. Analytics Dashboard (`/admin/media/analytics`)

The Media Analytics page provides administrators with detailed insights into image usage and storage.

#### Statistics Cards

Four key metrics are displayed at the top of the page:

1. **Total Bilder** (Total Images)
   - Shows total count of all images in the library
   - Icon: 📷

2. **Totalt Lagringsutrymme** (Total Storage)
   - Displays sum of all image file sizes in MB/GB
   - Icon: 💾

3. **Använda Bilder** (Used Images)
   - Count of images with usageCount > 0
   - Shows percentage of total images
   - Icon: ✅

4. **Oanvända Bilder** (Unused Images)
   - Count of images with usageCount = 0
   - Shows percentage of total images
   - Warning badge appears if > 20% are unused
   - Icon: ⚠️

#### Most Used Images Section

- Table displaying top 10 most used images
- Columns: Bild (thumbnail), Filnamn, Användningar (usage count), Storlek, Åtgärd
- Click on image or "Visa detaljer" to open detail modal
- Badges show usage count

#### Unused Images Section

- Grid display of all images with usageCount = 0
- Warning message: "Dessa bilder används inte i någon artikel"
- Shows total count and combined file size
- Bulk delete button: "Radera oanvända bilder"
- Confirmation modal before deletion
- Empty state message if no unused images exist

#### Largest Images Section

- Table showing top 10 largest images by file size
- Helps identify optimization opportunities
- Columns: Bild (thumbnail), Filnamn, Storlek, Dimensioner, Åtgärd
- Warning badge for images > 1 MB

### 2. Media Detail Modal

Opens when clicking on any image in the analytics dashboard.

#### Image Information

- Large preview (max 500px)
- **Filnamn**: Filename on server
- **Original namn**: Original upload filename
- **Storlek**: File size (KB/MB)
- **Dimensioner**: Width × Height in pixels
- **Uppladdad**: Relative date (e.g., "3 dagar sedan")
- **Uppladdad av**: Username of uploader
- **MIME-typ**: Image MIME type

#### Usage Information

- **Antal användningar**: Badge with usage count
- **Används i artiklar**: List of articles using this image
  - If usageCount > 0: Shows clickable list of article titles
  - If usageCount = 0: Shows info alert "Används inte i någon artikel"

#### Actions

- **📋 Kopiera URL**: Copy image URL to clipboard
- **🗑️ Radera**: Delete image (with confirmation)
- **Stäng**: Close modal

### 3. Confirm Modal Component

Reusable confirmation modal for destructive actions:

**Props:**
- `show`: Boolean to control visibility
- `onHide`: Callback when modal is closed
- `onConfirm`: Callback when confirmed
- `title`: Modal title (default: "Bekräfta")
- `message`: Confirmation message text
- `confirmText`: Confirm button text (default: "Bekräfta")
- `cancelText`: Cancel button text (default: "Avbryt")
- `variant`: Button variant (default: "danger")
- `isLoading`: Shows spinner on confirm button
- `children`: Additional content in modal body

## Backend API Endpoints

### GET `/api/media/analytics`

Returns comprehensive analytics data for the media library.

**Response:**
```json
{
  "success": true,
  "data": {
    "totalImages": 150,
    "totalSize": 52428800,
    "usedImages": 120,
    "unusedImages": 30,
    "mostUsed": [
      {
        "_id": "...",
        "filename": "image.jpg",
        "originalName": "original.jpg",
        "url": "/uploads/image.jpg",
        "usageCount": 15,
        "size": 102400,
        "width": 800,
        "height": 600
      }
      // ... top 10
    ],
    "largestImages": [
      {
        "_id": "...",
        "filename": "large.jpg",
        "originalName": "large-image.jpg",
        "url": "/uploads/large.jpg",
        "size": 2048000,
        "width": 3000,
        "height": 2000
      }
      // ... top 10
    ],
    "storageByType": {
      "image/jpeg": 30000000,
      "image/png": 20000000
    }
  }
}
```

**Implementation:**
- Uses MongoDB aggregation pipeline for efficient statistics calculation
- Queries for most used images (top 10, sorted by usageCount)
- Queries for largest images (top 10, sorted by size)
- Groups storage by MIME type

### GET `/api/media/:id/usage`

Returns detailed usage information for a specific image.

**Parameters:**
- `id`: Can be MongoDB ObjectId or filename (for backward compatibility)

**Response:**
```json
{
  "success": true,
  "data": {
    "usageCount": 5,
    "articles": [
      {
        "_id": "...",
        "slug": "article-slug",
        "title": "Article Title",
        "url": "/article/article-slug"
      }
      // ... all articles using this image
    ]
  }
}
```

**Implementation:**
- Accepts both ObjectId and filename for flexibility
- Searches Article collection for image URL in:
  - content field
  - clinicalSignificance field
  - interpretation field
  - images array
- Returns article metadata with clickable URLs

### DELETE `/api/media/bulk`

Bulk delete multiple images by their IDs.

**Request Body:**
```json
{
  "imageIds": ["id1", "id2", "id3"]
}
```

**Response:**
```json
{
  "success": true,
  "deleted": 3,
  "failed": 0,
  "errors": []
}
```

**Implementation:**
- Validates all IDs are valid MongoDB ObjectIds
- Deletes physical files from disk
- Deletes Media documents from database
- Handles errors gracefully
- Returns detailed results including any failures

## Frontend Components

### New Components

1. **ConfirmModal** (`src/components/ConfirmModal.js`)
   - Reusable confirmation dialog
   - Used for bulk delete and single image deletion
   - Supports loading states

2. **MediaDetailModal** (`src/components/MediaDetailModal.js`)
   - Displays comprehensive image information
   - Shows usage statistics and article list
   - Provides quick actions (copy URL, delete)

3. **MediaAnalytics** (`src/pages/MediaAnalytics.js`)
   - Main analytics dashboard page
   - Displays statistics cards
   - Shows most used, unused, and largest images
   - Handles bulk operations

### Updated Components

1. **AdminNavbar** (`src/components/AdminNavbar.js`)
   - Added "📊 Medieanalys" navigation link

2. **App.js** (`src/App.js`)
   - Added route for `/admin/media/analytics`

### API Service Updates

Added to `src/services/api.js`:

```javascript
// Get analytics data
export const getMediaAnalytics = async () => {
  const response = await axios.get(`${API_BASE_URL}/media/analytics`);
  return response.data;
};

// Get usage details for a specific image
export const getMediaUsageById = async (mediaId) => {
  const response = await axios.get(`${API_BASE_URL}/media/${mediaId}/usage`);
  return response.data;
};

// Bulk delete images
export const bulkDeleteMedia = async (imageIds) => {
  const response = await axios.delete(`${API_BASE_URL}/media/bulk`, {
    data: { imageIds }
  });
  return response.data;
};
```

## Swedish Language Support

All user-facing text is in Swedish as required:

### Common Terms
- **Bild/Bilder** = Image/Images
- **Filnamn** = Filename
- **Storlek** = Size
- **Användningar** = Usage/Uses
- **Oanvänd** = Unused
- **Radera** = Delete
- **Bekräfta** = Confirm
- **Avbryt** = Cancel
- **Laddar...** = Loading...
- **Uppladdad** = Uploaded
- **Dimensioner** = Dimensions
- **Totalt** = Total
- **Statistik** = Statistics
- **Används i** = Used in
- **artiklar** = articles
- **Kopiera URL** = Copy URL
- **Visa detaljer** = View details
- **Lagringsutrymme** = Storage space

### Messages
- "Är du säker på att du vill radera dessa bilder? Detta kan inte ångras."
- "Dessa bilder används inte i någon artikel"
- "Inga oanvända bilder hittades!"
- "URL kopierad till urklipp"
- "Bild raderad"
- "Något gick fel"

## Technical Details

### Error Handling
- API failures show Swedish error messages
- Toast notifications for user feedback
- Graceful fallbacks for missing data

### Performance Optimizations
- MongoDB aggregation pipelines for efficient queries
- Limit results to top 10 for most used/largest images
- Pagination support for unused images (up to 100)
- Lazy loading of usage data in detail modal

### UX Features
- Loading spinners during data fetch
- Empty state messages
- Confirmation dialogs for destructive actions
- Success/error toast notifications
- Responsive design for mobile/tablet/desktop
- Hover effects on clickable elements
- Badge indicators for warnings

## Usage Instructions

### For Administrators

1. **View Analytics**
   - Navigate to Admin Panel
   - Click "📊 Medieanalys" in navigation
   - View statistics cards at top of page

2. **Identify Unused Images**
   - Scroll to "Oanvända Bilder" section
   - Review unused images grid
   - Check total count and storage size

3. **Bulk Delete Unused Images**
   - Click "🗑️ Radera oanvända bilder" button
   - Review confirmation modal
   - Confirm deletion
   - Wait for success notification

4. **View Image Details**
   - Click on any image thumbnail
   - Or click "Visa detaljer" button
   - Review usage information
   - See which articles use the image
   - Copy URL or delete as needed

5. **Identify Large Images**
   - Review "Största Bilder" section
   - Identify optimization candidates
   - Images > 1 MB show warning badge

## Testing

### Manual Testing Checklist

- [ ] Analytics dashboard loads with correct statistics
- [ ] Statistics cards display accurate counts
- [ ] Most used images section shows images sorted by usage
- [ ] Unused images section shows only images with usageCount = 0
- [ ] Largest images section shows images sorted by size
- [ ] Clicking image opens detail modal
- [ ] Detail modal shows correct image information
- [ ] Usage information loads and displays article links
- [ ] Article links navigate to correct articles
- [ ] Copy URL button copies to clipboard
- [ ] Delete button opens confirmation modal
- [ ] Bulk delete shows confirmation with correct count
- [ ] Bulk delete successfully removes images
- [ ] Toast notifications appear for actions
- [ ] All text is in Swedish
- [ ] Loading states appear correctly
- [ ] Error states display Swedish messages
- [ ] Responsive design works on mobile
- [ ] Refresh button updates analytics data

### Backend Testing

Test the API endpoints:

```bash
# Test analytics endpoint
curl http://localhost:5001/api/media/analytics

# Test usage endpoint (replace with actual ID)
curl http://localhost:5001/api/media/507f1f77bcf86cd799439011/usage

# Test bulk delete (replace with actual IDs)
curl -X DELETE http://localhost:5001/api/media/bulk \
  -H "Content-Type: application/json" \
  -d '{"imageIds": ["id1", "id2"]}'
```

## Future Enhancements

Potential improvements for future versions:

1. **Storage Charts**
   - Pie chart for used vs unused storage
   - Bar chart for storage by image type
   - Trend charts over time

2. **Advanced Filtering**
   - Filter by upload date range
   - Filter by file size range
   - Filter by dimensions

3. **Export Capabilities**
   - Export analytics as CSV/PDF
   - Generate reports

4. **Optimization Suggestions**
   - Automatic image optimization
   - Compression recommendations
   - Format conversion suggestions

5. **Metadata Editing**
   - Edit alt text in modal
   - Update image descriptions
   - Tag management

## Troubleshooting

### Analytics Page Shows No Data

**Problem**: Dashboard loads but shows 0 for all statistics

**Solution**: 
- Check MongoDB connection
- Verify Media collection has documents
- Check browser console for API errors

### Bulk Delete Fails

**Problem**: Bulk delete operation fails silently

**Solution**:
- Check server logs for errors
- Verify file system permissions
- Check if images are locked by another process

### Images Not Loading in Modal

**Problem**: Detail modal opens but image doesn't display

**Solution**:
- Check image URL in browser DevTools
- Verify static file serving is configured
- Check CORS settings if images are on different domain

## Security Considerations

1. **Input Validation**
   - All IDs are validated before database queries
   - Filename validation prevents path traversal
   - Array inputs are type-checked

2. **Authorization**
   - Analytics page requires admin authentication
   - Delete operations require admin privileges
   - Usage information is only visible to authenticated users

3. **Error Messages**
   - Generic error messages to users
   - Detailed errors only in server logs
   - No sensitive information in client responses

## Conclusion

The Media Analytics feature provides a comprehensive solution for managing and optimizing the media library. It enables administrators to:

- Understand image usage patterns
- Identify and cleanup unused images
- Optimize storage usage
- Make informed decisions about media management

All requirements from Phase 3 have been successfully implemented with Swedish language support and clean, maintainable code.
