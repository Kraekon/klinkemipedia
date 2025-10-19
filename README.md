# Klinkemipedia

A comprehensive clinical chemistry reference website built with React and Express.js with MongoDB backend.

## Tech Stack

- **Frontend**: React 19, React Bootstrap, React Router, Axios, react-i18next
- **Backend**: Express.js, Node.js
- **Database**: MongoDB with Mongoose
- **Development**: Create React App, Nodemon, Concurrently
- **Internationalization**: i18next, react-i18next, i18next-browser-languagedetector

## Features

### Frontend Features
- 🎨 **Medical Blue Theme**: Professional clinical chemistry design
- 📱 **Responsive Design**: Works on mobile, tablet, and desktop
- 🔍 **Search Functionality**: Search articles integrated in navbar
- 📄 **Article Cards**: Beautiful preview cards with categories and tags
- 📊 **Reference Ranges Table**: Display clinical reference ranges in formatted tables
- 🚀 **React Router**: Smooth navigation between pages
- ⚡ **Loading States**: Spinner indicators during data fetching
- ❌ **Error Handling**: User-friendly error messages
- 🎯 **Clean Code**: Well-organized component structure
- 🌍 **Internationalization (i18n)**: Multi-language support (Swedish and English)

### Backend Features
- 📡 **RESTful API**: Clean and documented API endpoints
- 🔐 **CORS Enabled**: Cross-origin resource sharing configured
- 📝 **Full CRUD Operations**: Create, Read, Update, Delete articles
- 🔎 **Text Search**: MongoDB text search with indexing
- 📂 **Category Filtering**: Filter articles by category
- 🏷️ **Tag Support**: Multiple tags per article
- 👀 **View Tracking**: Automatic view count increment
- ✅ **Validation**: Mongoose schema validation

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (local installation or MongoDB Atlas account)
- npm or yarn

## Installation

1. Clone the repository:
```bash
git clone https://github.com/Kraekon/klinkemipedia.git
cd klinkemipedia
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:

   **Backend (.env in backend/ directory):**
   ```bash
   cp backend/.env.example backend/.env
   ```
   Update the MongoDB connection string if needed. Set PORT=5001 if you want to use port 5001.

   **Frontend (.env in root directory):**
   Create a `.env` file in the root directory:
   ```bash
   REACT_APP_API_URL=http://localhost:5001/api
   ```
   Change the port if your backend runs on a different port.

## ⚙️ Configuration

This project uses automatic configuration validation to prevent common setup issues.

### Quick Start

1. Copy environment template:
   ```bash
   cp .env.example .env
   ```

2. Add your MongoDB URI to `.env`

3. Start the app:
   ```bash
   npm run dev
   ```

The startup system will automatically:
- ✅ Validate .env file location (must be in project root)
- ✅ Check required variables (MONGODB_URI, PORT)
- ✅ Test MongoDB connection
- ✅ Lock port to 5001 (prevents configuration drift)
- ✅ Show clear error messages for any issues

### What You'll See

On successful startup:
```
🔍 Environment Configuration Check:
✅ .env file loaded from: /path/to/klinkemipedia/.env
✅ All environment variables validated successfully
✅ MongoDB URI configured
✅ Server will run on port 5001

🏥 Running Startup Health Checks:
✅ Port 5001 is available
✅ MongoDB connection healthy

🚀 Server Started Successfully!
📡 API available at: http://localhost:5001
🏥 Health check: http://localhost:5001/api/health
```

### Troubleshooting

If you encounter any issues, see **[docs/SETUP.md](docs/SETUP.md)** for:
- Detailed setup instructions
- Common error messages and solutions
- MongoDB configuration guide
- Health check usage
- Configuration files reference

## MongoDB Setup

### Option 1: Local MongoDB
1. Install MongoDB Community Edition from [mongodb.com](https://www.mongodb.com/try/download/community)
2. Start MongoDB service:
   - **Windows**: MongoDB service starts automatically
   - **macOS**: `brew services start mongodb-community`
   - **Linux**: `sudo systemctl start mongod`
3. MongoDB will be available at `mongodb://localhost:27017`

### Option 2: MongoDB Atlas (Cloud)
1. Create a free account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a new cluster
3. Get your connection string
4. Update `MONGODB_URI` in `backend/.env` with your Atlas connection string

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the React frontend in development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm run server`

Runs the Express backend server with nodemon.\
The API will be available at [http://localhost:5001](http://localhost:5001) (default port is 5000, but can be configured in backend/.env).

The server will restart automatically when you make changes to backend files.

### `npm run dev`

Runs both frontend and backend concurrently.\
This is the recommended way to run the full application during development.
- Frontend: [http://localhost:3000](http://localhost:3000)
- Backend API: [http://localhost:5001](http://localhost:5001)

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)

## API Documentation

### Base URL
```
http://localhost:5001/api
```
(Default is 5000, but can be changed via PORT in backend/.env)

### Endpoints

#### Test Endpoint
```
GET /api/test
```
Returns a simple test response to verify the API is running.

#### Articles

##### Get All Articles
```
GET /api/articles
```
Query parameters:
- `page` (number): Page number for pagination (default: 1)
- `limit` (number): Number of articles per page (default: 10)
- `category` (string): Filter by category
- `status` (string): Filter by status (draft, published, archived)
- `tags` (string): Comma-separated tags to filter by

Response:
```json
{
  "success": true,
  "count": 10,
  "total": 45,
  "page": 1,
  "pages": 5,
  "data": [...]
}
```

##### Get Article by Slug
```
GET /api/articles/:slug
```
Returns a single article by its slug. Increments the view count.

##### Create Article
```
POST /api/articles
```
Request body:
```json
{
  "title": "Albumin",
  "content": "Detailed article content...",
  "summary": "Brief summary",
  "category": "Proteins",
  "tags": ["protein", "liver", "kidney"],
  "status": "published"
}
```
Note: The slug will be auto-generated from the title if not provided.

##### Update Article
```
PUT /api/articles/id/:id
```
Request body: Same as create, all fields optional.

##### Delete Article
```
DELETE /api/articles/id/:id
```

##### Get Articles by Category
```
GET /api/articles/category/:category
```
Query parameters:
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 10)

##### Search Articles
```
GET /api/articles/search?q=query
```
Searches in article title, content, and tags.

Query parameters:
- `q` (string, required): Search query
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 10)

### Article Schema

```javascript
{
  title: String (required),
  slug: String (required, unique),
  content: String (required),
  summary: String,
  category: String (enum),
  tags: [String],
  referenceRanges: [{
    parameter: String,
    range: String,
    unit: String,
    notes: String
  }],
  relatedTests: [String],
  clinicalSignificance: String,
  interpretation: String,
  references: [String],
  images: [{
    url: String,
    caption: String,
    alt: String
  }],
  author: String,
  status: String (draft/published/archived),
  views: Number,
  createdAt: Date,
  updatedAt: Date
}
```

### Categories
- Enzymes
- Electrolytes
- Hormones
- Proteins
- Lipids
- Carbohydrates
- Vitamins
- Trace Elements
- Tumor Markers
- Immunology
- Hematology
- Other

## Project Structure

```
klinkemipedia/
├── backend/
│   ├── config/
│   │   └── db.js              # MongoDB connection
│   ├── controllers/
│   │   └── articleController.js # Article business logic
│   ├── models/
│   │   ├── Article.js         # Article schema
│   │   └── User.js            # User schema
│   ├── routes/
│   │   └── articles.js        # Article API routes
│   ├── .env.example           # Environment variables template
│   └── server.js              # Express server setup
├── public/                     # Static files
├── src/                        # React frontend
│   ├── components/            # Reusable React components
│   │   ├── Navbar.js          # Navigation bar with search
│   │   ├── ArticleCard.js     # Article preview card
│   │   ├── ArticleList.js     # Grid of article cards
│   │   ├── ArticleDetail.js   # Full article view
│   │   └── LoadingSpinner.js  # Loading spinner
│   ├── pages/                 # Page components
│   │   ├── HomePage.js        # Main landing page
│   │   ├── ArticlePage.js     # Individual article page
│   │   └── SearchPage.js      # Search results page
│   ├── services/              # API service layer
│   │   └── api.js             # Axios API calls
│   ├── App.js                 # Main app component with routing
│   ├── App.css                # Global styles
│   └── index.js               # React entry point
├── .env                        # Frontend environment variables (not committed)
└── package.json
```

## Image Upload & Management

### Overview
Klinkemipedia now supports image uploads for articles through an abstracted storage layer. Images are currently stored locally but can easily be migrated to cloud storage (Cloudinary, S3, etc.) in the future.

### Using Image Upload

1. **In Admin Panel**: When creating or editing an article, click the "📷 Upload Image" button below the content editor
2. **Drag & Drop**: Drag an image file into the upload area, or click to select from your file system
3. **Preview & Upload**: Review the image preview and click "Upload"
4. **Auto-Insert**: The image markdown syntax will be automatically inserted into your article content

### Supported Formats
- JPEG/JPG
- PNG
- GIF
- WEBP

### File Size Limit
Maximum file size: 5MB per image

### API Endpoint

```
POST /api/articles/upload
Content-Type: multipart/form-data

Request Body:
- image: File (image file)

Response:
{
  "success": true,
  "imageUrl": "/uploads/1234567890-image.jpg",
  "alt": "image",
  "filename": "1234567890-image.jpg",
  "size": 123456
}
```

### Storage Architecture

The image storage system is abstracted to allow easy migration to cloud storage:

```javascript
// Current: Local File System Storage
const storage = new LocalFileStorage();

// Future: Cloud Storage (Cloudinary)
const storage = new CloudinaryImageStorage();

// Future: Cloud Storage (AWS S3)
const storage = new S3Storage();
```

All images are stored in `backend/public/uploads/` and served via `/uploads` static route.

### Migrating to Cloud Storage

To migrate from local storage to cloud storage (e.g., Cloudinary):

1. **Install Cloudinary SDK** (already installed):
   ```bash
   npm install cloudinary
   ```

2. **Configure Environment Variables**:
   Add to `backend/.env`:
   ```
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   ```

3. **Update Storage Configuration**:
   In `backend/utils/imageStorage.js`, uncomment the `CloudinaryImageStorage` class and change the export:
   ```javascript
   const storage = new CloudinaryImageStorage();
   module.exports = storage;
   ```

4. **Restart Server**: No other code changes needed! All endpoints continue working.

See `backend/utils/imageStorage.js` for detailed implementation.

---

## Version History System

### Overview
Every time an article is updated, Klinkemipedia automatically saves the previous version as a revision. This allows you to:
- View all past versions of an article
- Compare differences between versions
- Restore an article to any previous version
- Track who made changes and when

### Using Version History

#### Viewing History
1. Open an article in edit mode
2. Click the "📜 Version History" button at the top
3. Browse all revisions with version numbers, timestamps, and change descriptions

#### Viewing a Specific Revision
1. Click "View" on any revision in the history list
2. See all fields as they existed in that version
3. Click "Restore This Version" to revert to that state

#### Comparing Versions
1. Click "Compare Versions" in the version history modal
2. Select two versions by checking their checkboxes
3. Click "Compare Selected"
4. A new window opens showing side-by-side comparison with highlighted differences

#### Restoring a Previous Version
1. View the revision you want to restore
2. Click "Restore This Version"
3. Confirm the action
4. A new revision is created (history is never lost)

### API Endpoints

#### Get All Revisions
```
GET /api/articles/:slug/revisions?page=1&limit=20

Response:
{
  "success": true,
  "data": [
    {
      "versionNumber": 5,
      "timestamp": "2025-01-15T10:30:00Z",
      "editedBy": "admin",
      "changeDescription": "Updated reference ranges"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 45,
    "pages": 3
  }
}
```

#### Get Specific Revision
```
GET /api/articles/:slug/revisions/:versionNumber

Response:
{
  "success": true,
  "data": {
    "versionNumber": 5,
    "title": "Sodium (Na+)",
    "content": "...",
    "timestamp": "2025-01-15T10:30:00Z",
    ...
  }
}
```

#### Restore to Previous Version
```
POST /api/articles/:slug/restore/:versionNumber
Content-Type: application/json

Request Body:
{
  "editedBy": "admin"  // Optional
}

Response:
{
  "success": true,
  "data": { /* restored article */ },
  "message": "Article restored to version 5"
}
```

#### Compare Two Versions
```
GET /api/articles/:slug/compare?v1=3&v2=5

Response:
{
  "success": true,
  "data": {
    "version1": { /* full revision data */ },
    "version2": { /* full revision data */ },
    "differences": {
      "title": false,
      "content": true,
      "category": false,
      ...
    }
  }
}
```

### ArticleRevision Schema

```javascript
{
  articleId: ObjectId (ref: Article),
  versionNumber: Number,
  title: String,
  slug: String,
  content: String,
  summary: String,
  category: String,
  tags: [String],
  referenceRanges: [Object],
  clinicalSignificance: String,
  interpretation: String,
  relatedTests: [String],
  references: [String],
  images: [Object],
  status: String,
  editedBy: String,
  changeDescription: String,
  timestamp: Date
}
```

### Technical Details

- **Auto-Save**: Revisions are automatically created before any article update
- **Version Numbers**: Auto-incrementing version numbers per article
- **No Data Loss**: Restoring a version creates a new revision instead of deleting history
- **Efficient Storage**: Indexed queries for fast retrieval
- **Pagination**: Large revision histories are paginated to improve performance

---

## Internationalization (i18n)

### Overview
Klinkemipedia supports multiple languages using **react-i18next**. The application currently supports:
- **Swedish (sv)** - Default language
- **English (en)** - Secondary language

### Language Switching
Users can switch languages using the language switcher in the navigation bar:
- **Public pages**: Dropdown in the top-right corner of the navbar
- **Admin pages**: Dropdown in the admin navbar next to other navigation items

The selected language preference is saved to `localStorage` and persists across sessions.

### For Users
1. Click the language switcher (flag icon) in the navigation bar
2. Select your preferred language (Swedish or English)
3. All text on the page will update immediately
4. Your preference is saved automatically

### For Developers

#### Adding New Translations
To add or update translations, edit the translation files:
- **English**: `src/locales/en/translation.json`
- **Swedish**: `src/locales/sv/translation.json`

Example:
```json
{
  "mySection": {
    "newKey": "New text here"
  }
}
```

#### Using Translations in Components
```javascript
import { useTranslation } from 'react-i18next';

function MyComponent() {
  const { t } = useTranslation();
  
  return <div>{t('mySection.newKey')}</div>;
}
```

#### Pluralization
```javascript
// Translation file
{
  "articleCount": "{{count}} article",
  "articleCount_plural": "{{count}} articles"
}

// Component
<p>{t('articleCount', { count: articles.length })}</p>
```

#### Interpolation
```javascript
// Translation file
{
  "welcome": "Welcome, {{name}}!"
}

// Component
<p>{t('welcome', { name: user.name })}</p>
```

### Documentation
For detailed translation management guidelines, see [docs/TRANSLATIONS.md](docs/TRANSLATIONS.md).

---

## Future Features

- User authentication and authorization
- Role-based access control (user, contributor, admin)
- Comments and discussions
- Bookmark/favorite articles
- Advanced search with filters
- PDF export of articles
- Multi-language support
- Rich text diff visualization for version comparison
- Bulk image upload
- Image optimization and resizing

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
