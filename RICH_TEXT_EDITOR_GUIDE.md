# Rich Text Editor Implementation Guide

## Overview

This implementation adds a feature-rich TinyMCE-based article editor to Klinkemipedia with auto-save functionality, draft management, and media upload capabilities.

## Features Implemented

### 1. TinyMCE Rich Text Editor
- **Component**: `ArticleEditor.js`
- **Features**:
  - Full-featured WYSIWYG editor with TinyMCE
  - Comprehensive plugin support (lists, links, images, tables, code, etc.)
  - Image upload with drag-and-drop support
  - Live preview mode toggle
  - Mobile-responsive design

### 2. Auto-Save Functionality
- **Debounced Auto-Save**: Automatically saves drafts 2 seconds after user stops typing
- **Status Indicators**: 
  - Real-time saving status display
  - Last saved timestamp
  - Visual feedback for save operations
- **Draft Restoration**: Automatically loads existing drafts when editing

### 3. Statistics Display
- **Word Count**: Real-time word counting
- **Character Count**: Tracks total characters
- **Reading Time**: Estimates reading time based on 200 words/minute
- **Display**: All statistics shown in a status bar at the top of the editor

### 4. Media Upload Integration
- **Endpoint**: `/api/media/upload`
- **Features**:
  - Direct image upload from TinyMCE
  - Drag-and-drop image support
  - Automatic image optimization (via backend Sharp library)
  - Progress tracking during uploads
  - Error handling with user feedback

### 5. Draft Management
- **My Drafts Page** (`MyDrafts.js`):
  - Grid view of all user drafts
  - Draft preview cards with metadata
  - Quick edit and delete actions
  - Time-since-last-saved display
  - Empty state with call-to-action

### 6. Article Editor Page
- **Component**: `ArticleEditorPage.js`
- **Fields**:
  - Title (required)
  - Category (dropdown, required)
  - Tags (comma-separated input)
  - Content (TinyMCE editor, required)
- **Actions**:
  - Save Draft (manual save trigger)
  - Publish (creates/updates article)
  - Discard Draft (with confirmation modal)

### 7. Navigation Guards
- **Browser Navigation**: Warns before leaving page with unsaved changes
- **Implementation**: Uses `beforeunload` event listener
- **Trigger**: Only activates when `hasUnsavedChanges` is true

### 8. API Integration

#### Draft APIs (added to `services/api.js`):
```javascript
- getDrafts(): Get all drafts for current user
- getDraft(draftId): Get specific draft
- saveDraft(draftData): Create new draft
- updateDraft(draftId, draftData): Update existing draft
- deleteDraft(draftId): Delete draft
```

#### Media Upload API:
```javascript
- uploadMedia(file, onUploadProgress): Upload image with progress tracking
```

### 9. Routing
New routes added to `App.js`:
- `/admin/editor/new` - Create new article with rich editor
- `/admin/editor/:slug` - Edit existing article
- `/admin/editor/draft/:draftId` - Edit specific draft
- `/admin/my-drafts` - View and manage drafts

### 10. Mobile Responsive Design
- **Breakpoints**:
  - Mobile: < 576px
  - Tablet: < 768px
  - Desktop: >= 768px
- **Responsive Features**:
  - Stacked layouts on mobile
  - Touch-friendly buttons
  - Optimized status bar layout
  - Full-width action buttons on small screens

## File Structure

```
src/
├── components/
│   ├── ArticleEditor.js          # Main rich text editor component
│   ├── ArticleEditor.css         # Editor styles
│   ├── ArticleEditor.test.js     # Comprehensive tests (12 tests)
│   └── AdminNavbar.js            # Updated with new navigation links
├── pages/
│   ├── ArticleEditorPage.js      # Editor page wrapper
│   ├── ArticleEditorPage.css     # Page styles
│   ├── MyDrafts.js               # Draft management page
│   └── MyDrafts.css              # Draft page styles
├── services/
│   └── api.js                    # Added draft and media APIs
└── App.js                        # Updated routing
```

## Backend APIs Used

### Draft API (`/api/drafts`)
- **Base Routes**: Implemented in `backend/routes/drafts.js`
- **Model**: `backend/models/Draft.js`
- **Features**:
  - User-scoped drafts
  - Auto-expiry after 30 days
  - Article association support
  - Metadata storage (word count, cursor position, editor mode)

### Media Upload API (`/api/media/upload`)
- **Base Route**: Implemented in `backend/routes/media.js`
- **Features**:
  - Image validation (JPEG, PNG, GIF, WebP)
  - 5MB file size limit
  - Automatic image optimization with Sharp
  - Unique filename generation

## Security Considerations

### 1. HTML Sanitization
- Uses `DOMParser` for safe HTML-to-text conversion
- Prevents XSS attacks through proper React rendering
- TinyMCE content is trusted (admin-only access)

### 2. Authentication
- All editor routes protected with `ProtectedRoute` HOC
- Requires admin authentication (`requireAdmin={true}`)
- Draft APIs use backend authentication middleware

### 3. Input Validation
- Required field validation (title, category, content)
- File type validation for uploads
- File size limits enforced
- Tag and category whitelisting

### 4. CodeQL Analysis
- All security alerts resolved
- No XSS vulnerabilities detected
- Safe HTML handling verified

## Usage Guide

### Creating a New Article
1. Navigate to `/admin/editor/new` or click "Rich Editor" in admin navbar
2. Fill in title, category, and tags
3. Write content in the TinyMCE editor
4. Auto-save activates after 2 seconds of inactivity
5. Click "Publish Article" when ready

### Editing a Draft
1. Navigate to `/admin/my-drafts` or click "My Drafts" in admin navbar
2. Click "Edit" on any draft card
3. Continue editing with auto-save
4. Publish or discard when done

### Uploading Images
1. In the TinyMCE editor, click the "Image" button in the toolbar
2. Choose to upload an image
3. Drag-and-drop or select file
4. Image automatically uploads and inserts into content

### Using Preview Mode
1. Click the "👁️ Preview Mode" button while editing
2. View rendered HTML output
3. Click "📝 Edit Mode" to return to editing

## Testing

### Test Suite
- **File**: `src/components/ArticleEditor.test.js`
- **Tests**: 12 comprehensive tests
- **Coverage**:
  - Component rendering
  - User interactions
  - Form validation
  - Button states
  - Callback functions

### Running Tests
```bash
npm test -- ArticleEditor
```

### All Tests Pass
```
✓ renders editor with initial values
✓ displays word count, character count, and reading time
✓ shows save draft button
✓ shows publish button
✓ shows discard draft button
✓ toggles between edit and preview mode
✓ updates title when typing
✓ updates category when selected
✓ disables publish button when required fields are empty
✓ enables publish button when all required fields are filled
✓ calls onPublish when publish button is clicked
✓ calls onDiscard when discard button is clicked
```

## Dependencies Added

### Package
- `@tinymce/tinymce-react`: ^4.x (latest compatible version)

### Installation
```bash
npm install --legacy-peer-deps @tinymce/tinymce-react
```

## Build Status
- ✅ Build successful
- ✅ All tests passing
- ✅ No lint errors
- ✅ CodeQL security checks passed
- ✅ Mobile responsive verified

## Performance Considerations

1. **Bundle Size**: TinyMCE adds ~600KB to bundle (acceptable for admin panel)
2. **Auto-Save Debouncing**: 2-second delay prevents excessive API calls
3. **Image Optimization**: Backend uses Sharp for automatic compression
4. **Lazy Loading**: Consider code-splitting for production optimization

## Future Enhancements

1. **Collaborative Editing**: Real-time multi-user editing
2. **Revision History**: Track changes within drafts
3. **Rich Formatting Presets**: Template-based content insertion
4. **Markdown Support**: Alternative to WYSIWYG for power users
5. **Cloud Storage**: Direct integration with Cloudinary/S3
6. **Offline Support**: Local storage for offline drafting

## Browser Compatibility

- ✅ Chrome/Edge (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

## Accessibility

- Keyboard navigation supported
- ARIA labels on interactive elements
- Screen reader compatible
- High contrast mode support

## Maintenance

### Updating TinyMCE
```bash
npm update @tinymce/tinymce-react
```

### Monitoring Draft Storage
- Drafts auto-expire after 30 days (configured in Draft model)
- Monitor database for draft accumulation
- Consider manual cleanup scripts if needed

## Troubleshooting

### Issue: TinyMCE not loading
**Solution**: Check that `apiKey` is set (currently using "no-api-key" for self-hosted)

### Issue: Images not uploading
**Solution**: Verify backend media API is running and Sharp is installed

### Issue: Auto-save not working
**Solution**: Check network tab for API errors, verify authentication

### Issue: Drafts not appearing
**Solution**: Verify user is authenticated and has admin role

## Support

For issues or questions:
1. Check browser console for errors
2. Verify backend API is running
3. Check network requests in DevTools
4. Review CodeQL security alerts
5. Consult TinyMCE documentation: https://www.tiny.cloud/docs/

## License

This implementation follows the same license as the Klinkemipedia project.
