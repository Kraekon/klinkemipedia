# Testing Guide for Phase 2: Image Upload & Version History

This guide provides instructions for testing the newly implemented features.

## Prerequisites

1. **Start MongoDB**: Ensure MongoDB is running
   ```bash
   # Local MongoDB
   mongod
   
   # Or use MongoDB Atlas connection string in .env
   ```

2. **Configure Environment**:
   ```bash
   cp .env.example .env
   # Edit .env and add your MONGODB_URI
   ```

3. **Install Dependencies**:
   ```bash
   npm install
   ```

4. **Start the Application**:
   ```bash
   npm run dev
   ```
   - Frontend: http://localhost:3000
   - Backend: http://localhost:5001

---

## Part A: Image Upload Testing

### Test 1: Upload Image via UI

1. Navigate to **Admin Panel** → **Create New Article** or edit an existing article
2. Fill in the required article fields (title, category, summary, content)
3. Click the **📷 Upload Image** button below the content editor
4. **Drag and drop** an image file OR **click** to select from file system
5. **Verify**:
   - ✅ Image preview displays
   - ✅ File size is shown
   - ✅ Upload button is enabled
6. Click **Upload**
7. **Verify**:
   - ✅ Progress bar shows upload progress
   - ✅ Success toast notification appears
   - ✅ Markdown image syntax is inserted into content: `![alt text](url)`
   - ✅ Modal closes after successful upload

### Test 2: Upload Image via API

```bash
# Upload an image
curl -X POST http://localhost:5001/api/articles/upload \
  -F "image=@/path/to/test-image.jpg"

# Expected Response:
# {
#   "success": true,
#   "imageUrl": "/uploads/1234567890-test-image.jpg",
#   "alt": "test-image",
#   "filename": "1234567890-test-image.jpg",
#   "size": 123456
# }
```

### Test 3: Validate Image in Article

1. After uploading, save the article
2. Navigate to the article's public view page
3. **Verify**:
   - ✅ Image is displayed correctly
   - ✅ Image loads from `/uploads/` path
   - ✅ Image is responsive on different screen sizes

### Test 4: File Validation

**Test Invalid File Type:**
1. Try to upload a `.txt` or `.pdf` file
2. **Expected**: Error message "Invalid file type. Only JPG, PNG, GIF, and WEBP images are allowed."

**Test Large File:**
1. Try to upload an image larger than 5MB
2. **Expected**: Error message "File size exceeds 5MB limit."

### Test 5: Multiple Images in One Article

1. Upload multiple images to the same article
2. **Verify**:
   - ✅ Each image has unique filename with timestamp
   - ✅ All images display correctly
   - ✅ Images can be arranged in markdown content

---

## Part B: Version History Testing

### Test 1: Create First Revision

1. Create a new article or open an existing one for editing
2. Make changes to the article (e.g., update content)
3. Click **Publish** or **Save as Draft**
4. **Verify**:
   - ✅ Article is updated successfully
   - ✅ No errors in console
   - ✅ A revision is created in the database

### Test 2: View Version History

1. Open an article in edit mode
2. Click the **📜 Version History** button (top-right)
3. **Verify**:
   - ✅ Modal opens showing revision list
   - ✅ Each revision shows:
     - Version number
     - Timestamp (relative: "2 hours ago" or absolute date)
     - Edited by (username)
     - Change description
   - ✅ Revisions are ordered by version number (newest first)

### Test 3: View Specific Revision

1. In the version history modal, click **View** on any revision
2. **Verify**:
   - ✅ Modal switches to revision detail view
   - ✅ All article fields are shown as they were in that version:
     - Title
     - Category
     - Summary
     - Content (in read-only format)
     - Status
   - ✅ Change description is displayed (if present)
   - ✅ "Back to List" button returns to revision list
   - ✅ "Restore This Version" button is visible

### Test 4: Compare Two Versions

1. In version history modal, click **Compare Versions**
2. Select **two versions** by checking their checkboxes
3. **Verify**:
   - ✅ Checkbox counter shows "2/2 selected"
   - ✅ "Compare Selected" button appears
4. Click **Compare Selected**
5. **Verify**:
   - ✅ New window/tab opens with comparison view
   - ✅ Side-by-side comparison is displayed
   - ✅ Changed fields are highlighted in yellow
   - ✅ Unchanged fields are in gray
   - ✅ Each version shows its version number
   - ✅ Content differences are visible

### Test 5: Restore Previous Version

1. View a specific revision
2. Click **Restore This Version**
3. Confirm the action in the dialog
4. **Verify**:
   - ✅ Success message appears
   - ✅ Article is updated with old version content
   - ✅ A NEW revision is created (not deleted)
   - ✅ Version history modal closes
   - ✅ Article form refreshes with restored content

### Test 6: Version History API Tests

**Get All Revisions:**
```bash
curl http://localhost:5001/api/articles/sodium-na/revisions

# Expected Response:
# {
#   "success": true,
#   "data": [
#     {
#       "versionNumber": 3,
#       "timestamp": "2025-01-15T10:30:00.000Z",
#       "editedBy": "admin",
#       "changeDescription": "Updated reference ranges"
#     },
#     ...
#   ],
#   "pagination": {
#     "page": 1,
#     "limit": 20,
#     "total": 3,
#     "pages": 1
#   }
# }
```

**Get Specific Revision:**
```bash
curl http://localhost:5001/api/articles/sodium-na/revisions/2

# Expected Response:
# {
#   "success": true,
#   "data": {
#     "versionNumber": 2,
#     "title": "Sodium (Na+)",
#     "content": "...",
#     ...
#   }
# }
```

**Compare Versions:**
```bash
curl "http://localhost:5001/api/articles/sodium-na/compare?v1=1&v2=2"

# Expected Response:
# {
#   "success": true,
#   "data": {
#     "version1": { ... },
#     "version2": { ... },
#     "differences": {
#       "title": false,
#       "content": true,
#       "category": false,
#       ...
#     }
#   }
# }
```

**Restore Version:**
```bash
curl -X POST http://localhost:5001/api/articles/sodium-na/restore/1 \
  -H "Content-Type: application/json" \
  -d '{"editedBy": "admin"}'

# Expected Response:
# {
#   "success": true,
#   "data": { ... restored article ... },
#   "message": "Article restored to version 1"
# }
```

---

## Integration Testing

### Test 1: Image Upload + Version History

1. Create a new article
2. Upload an image
3. Save the article
4. Edit the article again and upload another image
5. Save again
6. Open version history
7. **Verify**:
   - ✅ Two versions exist
   - ✅ View version 1 shows only the first image
   - ✅ Current version shows both images
8. Restore to version 1
9. **Verify**:
   - ✅ Only first image is in content
   - ✅ Version history now has 3 versions (original, edited, restored)

### Test 2: Pagination Testing

1. Make 25+ edits to an article
2. Open version history
3. **Verify**:
   - ✅ Only 20 revisions shown on first page
   - ✅ Pagination controls appear
   - ✅ Can navigate to page 2
   - ✅ Page numbers are clickable

### Test 3: Change Description Testing

1. Edit an article
2. In the update request, include a change description (note: this requires modifying the API call or adding a UI field)
3. **Verify**:
   - ✅ Change description appears in version history
   - ✅ Description is shown in revision detail view

---

## Error Handling Tests

### Image Upload Errors

1. **No file selected**: Try to upload without selecting a file
   - Expected: "No image file provided" error

2. **Network error**: Stop the backend server and try to upload
   - Expected: Connection error message

3. **Large file**: Upload file > 5MB
   - Expected: "File size exceeds 5MB limit"

4. **Invalid type**: Upload a .pdf file
   - Expected: "Invalid file type" error

### Version History Errors

1. **Non-existent revision**: Request version 999 that doesn't exist
   - Expected: 404 "Revision not found"

2. **Invalid article**: Request revisions for non-existent article
   - Expected: 404 "Article not found"

3. **Invalid comparison**: Compare with invalid version numbers
   - Expected: 400 "Both v1 and v2 version numbers are required"

---

## Performance Testing

### Image Upload Performance

1. Upload images of various sizes:
   - Small (< 100KB): Should upload instantly
   - Medium (500KB - 1MB): Should upload in 1-2 seconds
   - Large (3-5MB): Should upload in 3-5 seconds

2. **Verify**:
   - ✅ Progress bar updates smoothly
   - ✅ No UI blocking during upload
   - ✅ Upload completes successfully

### Version History Performance

1. Create 50+ revisions for an article
2. Open version history
3. **Verify**:
   - ✅ List loads in < 2 seconds
   - ✅ Pagination is smooth
   - ✅ No lag when viewing specific revisions

---

## Browser Compatibility Testing

Test on multiple browsers:
- ✅ Chrome/Edge (Chromium)
- ✅ Firefox
- ✅ Safari

**Features to test:**
1. Image drag & drop
2. File picker
3. Modal animations
4. Version history UI
5. Side-by-side comparison view

---

## Mobile Testing

Test on mobile devices or browser dev tools mobile mode:

1. **Image Upload**:
   - ✅ Upload button is accessible
   - ✅ File picker opens correctly
   - ✅ Preview displays properly
   - ✅ Modal is responsive

2. **Version History**:
   - ✅ Version history button is accessible
   - ✅ Modal is scrollable
   - ✅ Table is responsive
   - ✅ Buttons are touchable

---

## Security Testing

### File Upload Security

1. **Path Traversal**: Try uploading with malicious filename like `../../etc/passwd.jpg`
   - Expected: Filename is sanitized

2. **Script Injection**: Try uploading image with script in filename
   - Expected: Special characters are removed

3. **MIME Type Spoofing**: Rename a .txt file to .jpg
   - Expected: Upload rejected based on actual MIME type

### Version History Security

1. Test without authentication (if implemented)
   - Expected: Protected endpoints require authentication

2. Test with SQL injection in query parameters
   - Expected: MongoDB ODM prevents injection

---

## Cleanup

After testing:

1. **Remove test images**:
   ```bash
   rm backend/public/uploads/*
   ```

2. **Clean test data** from MongoDB:
   ```bash
   mongo
   use klinkemipedia
   db.articles.deleteMany({ title: /test/i })
   db.articlerevisions.deleteMany({})
   ```

---

## Troubleshooting

### Images not displaying
- Check static file serving is configured: `app.use('/uploads', express.static(...))`
- Verify image exists in `backend/public/uploads/`
- Check browser console for 404 errors

### Revisions not being created
- Check PUT endpoint is saving revisions before updating
- Verify ArticleRevision model is imported correctly
- Check MongoDB for `articlerevisions` collection

### Version History not loading
- Verify article exists and has revisions
- Check browser console for API errors
- Verify backend routes are registered

---

## Success Criteria

All features are working correctly if:

✅ Images can be uploaded via drag & drop or file picker
✅ Images are displayed in articles
✅ File validation works (type and size)
✅ Revisions are automatically created on article updates
✅ Version history lists all revisions
✅ Specific revisions can be viewed
✅ Two versions can be compared side-by-side
✅ Previous versions can be restored
✅ No errors in browser console
✅ No errors in server logs
✅ Build completes successfully
✅ All API endpoints return expected responses

---

## Automated Testing (Future)

For continuous integration, consider adding:

1. **Jest tests** for React components
2. **Supertest** for API endpoint testing
3. **Cypress** or **Playwright** for E2E testing
4. **Image upload mock tests**
5. **Version history API tests**

Example test structure:
```javascript
describe('Image Upload', () => {
  it('should upload image successfully', async () => {
    // Test implementation
  });
  
  it('should reject invalid file type', async () => {
    // Test implementation
  });
});

describe('Version History', () => {
  it('should create revision on update', async () => {
    // Test implementation
  });
  
  it('should list all revisions', async () => {
    // Test implementation
  });
});
```

---

For issues or questions, refer to the main [README.md](../README.md) or open an issue on GitHub.
