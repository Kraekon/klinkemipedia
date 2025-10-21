# Media Library Image Picker - User Flow

## Visual Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                    Article Editor (AdminArticleForm)             │
│                                                                   │
│  [Title Input]                                                   │
│  [Category Select]                                               │
│  [Content Editor - MDEditor]                                     │
│                                                                   │
│  ┌─────────────────────────────────────────────┐                │
│  │       📷 Upload Image (Button)               │ ◄─── Click     │
│  └─────────────────────────────────────────────┘                │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
                           │
                           │ Opens Modal
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Image Upload Modal                            │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                    ImageUploader Component                │   │
│  │                                                            │   │
│  │  ┌────────────────────────────────────────────┐          │   │
│  │  │   📁 Drag & Drop or Click to Select        │          │   │
│  │  │   Supported: JPG, PNG, GIF, WEBP (max 5MB) │          │   │
│  │  └────────────────────────────────────────────┘          │   │
│  │                                                            │   │
│  │              ─────── OR ───────                           │   │
│  │                                                            │   │
│  │  ┌────────────────────────────────────────────┐          │   │
│  │  │    📁 Browse Media Library (Button)        │ ◄─ Click │   │
│  │  └────────────────────────────────────────────┘          │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                           │
                           │ Opens Media Library Modal
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│              Media Library Modal (MediaLibraryModal)             │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  🔍 Search: [_______________] [×]                        │   │
│  │  Filter: [All Images ▼]  Sort By: [Newest First ▼]      │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                   │
│  ┌────────┬────────┬────────┬────────┬────────┬────────┐        │
│  │ ┌────┐ │ ┌────┐ │ ┌────┐ │ ┌────┐ │ ┌────┐ │ ┌────┐ │        │
│  │ │IMG │ │ │IMG │ │ │IMG │ │ │IMG │ │ │IMG │ │ │IMG │ │        │
│  │ └────┘ │ └────┘ │ └────┘ │ └────┘ │ └────┘ │ └────┘ │        │
│  │ image1 │ image2 │ image3 │ image4 │ image5 │ image6 │        │
│  │ 800×600│ 1024×  │ 640×   │ 1920×  │ 512×   │ 2048×  │        │
│  │ [Sel.] │ [Sel.] │ [Sel.] │ [Sel.] │ [Sel.] │ [Sel.] │ ◄─Click│
│  └────────┴────────┴────────┴────────┴────────┴────────┘        │
│                                                                   │
│  [◄ Previous]      Page 1 of 3      [Next ►]                    │
│                                                                   │
│  [Cancel]                                                         │
└─────────────────────────────────────────────────────────────────┘
                           │
                           │ Select Image
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Article Editor (AdminArticleForm)             │
│                                                                   │
│  [Title Input]                                                   │
│  [Category Select]                                               │
│  [Content Editor - MDEditor]                                     │
│                                                                   │
│  Article content here...                                         │
│  ![image description](http://example.com/images/image1.jpg) ◄──┐│
│  More content...                                               ││ │
│                                                    Image URL inserted│
│                                                                   │
│  ✓ Success: Image selected from library!                        │
└─────────────────────────────────────────────────────────────────┘
```

## Component Interaction Flow

### Step 1: User Initiates Image Insertion
```
AdminArticleForm
    │
    ├─► User clicks "📷 Upload Image" button
    │
    └─► Opens Modal with ImageUploader component
```

### Step 2: User Chooses Browse Library
```
ImageUploader
    │
    ├─► User sees two options:
    │   ├─ [Upload Area] - Drag & drop or click to browse files
    │   └─ [Browse Library Button] - Browse existing images
    │
    └─► User clicks "📁 Browse Media Library"
        │
        └─► Opens MediaLibraryModal
```

### Step 3: User Searches and Selects Image
```
MediaLibraryModal
    │
    ├─► Fetches media from API: GET /api/media?page=1&limit=20&...
    │
    ├─► User can:
    │   ├─ Search by filename (debounced 300ms)
    │   ├─ Filter: All / Used / Unused
    │   ├─ Sort: Newest / Oldest / A-Z / Z-A
    │   └─ Navigate pages
    │
    ├─► Displays grid of MediaPickerCard components
    │   │
    │   └─► Each card shows:
    │       ├─ Thumbnail
    │       ├─ Filename
    │       ├─ Dimensions (800 × 600)
    │       ├─ File size
    │       ├─ Usage count (if used)
    │       └─ [Select] button
    │
    └─► User clicks [Select] on a card
        │
        └─► Calls onSelectImage({ url, filename, originalName, width, height })
```

### Step 4: Image Inserted into Article
```
ImageUploader.handleSelectFromLibrary()
    │
    └─► Calls onUploadSuccess({ url, alt, filename })
        │
        └─► AdminArticleForm.handleImageUploadSuccess()
            │
            ├─► Generates markdown: ![alt](url)
            │
            ├─► Inserts into content field
            │
            ├─► Closes modal
            │
            └─► Shows success toast: "Image uploaded successfully!"
```

## API Request Flow

### Initial Load
```
Frontend                    Backend
   │                           │
   ├─ GET /api/media ─────────►│
   │  ?page=1                   │
   │  &limit=20                 │
   │  &sort=date                │
   │  &order=desc               │
   │  &filter=all               │
   │                            │
   │◄─ 200 OK ─────────────────┤
   │  {                         │
   │    success: true,          │
   │    data: [...],            │
   │    pagination: {...},      │
   │    stats: {...}            │
   │  }                         │
```

### With Search
```
Frontend                    Backend
   │                           │
   ├─ GET /api/media ─────────►│
   │  ?search=diagram           │
   │  &filter=used              │
   │  &sort=name                │
   │  &order=asc                │
   │  &page=1                   │
   │  &limit=20                 │
   │                            │
   │◄─ 200 OK ─────────────────┤
   │  {                         │
   │    success: true,          │
   │    data: [filtered],       │
   │    pagination: {...},      │
   │    stats: {...}            │
   │  }                         │
```

## State Management Flow

### MediaLibraryModal State
```
Initial State:
  ├─ media: []
  ├─ loading: false
  ├─ page: 1
  ├─ filter: 'all'
  ├─ sort: 'date'
  ├─ order: 'desc'
  ├─ search: ''
  └─ searchInput: ''

User types "test" in search:
  ├─ searchInput: "test" (immediate)
  └─ [300ms debounce]
      └─ search: "test" (triggers API call)
          └─ fetchMedia() called
              ├─ loading: true
              ├─ API call: GET /api/media?search=test&...
              ├─ media: [results from API]
              └─ loading: false

User changes filter to "used":
  ├─ filter: "used"
  ├─ page: 1 (reset)
  └─ fetchMedia() called
      └─ API call: GET /api/media?filter=used&...

User clicks Select on an image:
  └─ onSelectImage({ url, filename, ... })
      ├─ Closes modal
      └─ Calls parent's handleSelectFromLibrary()
```

## Responsive Grid Layout

### Desktop (lg: ≥992px)
```
┌────┬────┬────┬────┬────┬────┐
│ 1  │ 2  │ 3  │ 4  │ 5  │ 6  │  ← 6 columns
├────┼────┼────┼────┼────┼────┤
│ 7  │ 8  │ 9  │ 10 │ 11 │ 12 │
└────┴────┴────┴────┴────┴────┘
```

### Tablet (md: 768px-991px)
```
┌────┬────┬────┬────┐
│ 1  │ 2  │ 3  │ 4  │  ← 4 columns
├────┼────┼────┼────┤
│ 5  │ 6  │ 7  │ 8  │
└────┴────┴────┴────┘
```

### Mobile (xs: <576px)
```
┌─────┬─────┐
│  1  │  2  │  ← 2 columns
├─────┼─────┤
│  3  │  4  │
└─────┴─────┘
```

## Error Handling Flow

### API Error
```
fetchMedia()
    │
    └─► API call fails
        │
        ├─ loading: false
        ├─ error: "Failed to fetch media"
        │
        └─► Shows error alert at top of modal
            └─ User can dismiss or retry
```

### Empty State
```
fetchMedia()
    │
    └─► API returns empty array
        │
        ├─ loading: false
        ├─ media: []
        │
        └─► Shows empty state
            ├─ Icon: 📷
            ├─ Message: "No images found"
            └─ Hint: "Try adjusting your search or filters"
```

## Performance Considerations

### Debounced Search
```
User types: "t" → "te" → "tes" → "test"
           0ms   50ms   100ms  150ms
            │     │      │      │
            └─────┴──────┴──────┘
                    │
                [300ms wait]
                    │
                 [API call]
Only 1 API call made after user stops typing
```

### Lazy Loading
```html
<img src={media.url} loading="lazy" alt={...} />
```
Images only load when they enter the viewport, saving bandwidth.

### Pagination
```
Total: 100 images
Display: 20 per page
Pages: 5

Only loads 20 images at a time
User must navigate to see more
Reduces initial load time and memory usage
```
