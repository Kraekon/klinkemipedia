# Tags System Documentation

## Overview

The tags system allows articles to be tagged with multiple keywords for better organization and discoverability. This document describes the implementation of Phase 2: Tags System.

## Features

### Backend Features

1. **Tag Normalization**
   - Tags are automatically converted to lowercase
   - Leading and trailing whitespace is trimmed
   - Empty tags are filtered out

2. **Tag Validation**
   - Maximum 10 tags per article
   - Tags are validated on both create and update operations

3. **Tag API Endpoints**
   - `GET /api/tags` - Get all tags with article counts
   - `GET /api/tags/:tag/articles` - Get articles by specific tag (with pagination)
   - `PUT /api/tags/merge` - Merge multiple tags into one (admin only)
   - `DELETE /api/tags/:tag` - Delete a tag from all articles (admin only)

### Frontend Features

1. **Tag Components**
   - **TagBadge**: Clickable or static tag badge with optional remove button
   - **TagInput**: Tag input field with autocomplete suggestions
   - **TagCloud**: Visual tag cloud with size based on usage
   - **TagList**: List view of tags with counts

2. **Tag Pages**
   - **TagBrowsePage** (`/tags`): Browse all tags with cloud and list views
   - **TagArticlesPage** (`/tag/:tagname`): View all articles with a specific tag
   - **AdminTagManagement** (`/admin/tags`): Admin page to merge and delete tags

3. **Integration**
   - Tags are displayed on article cards
   - Tags are displayed on article detail pages
   - Tags are clickable and filter to tagged articles
   - Tag input with autocomplete in article editor

## Usage

### Adding Tags to Articles

In the admin article editor:
1. Navigate to the Metadata section
2. Use the tag input field
3. Type a tag name and press Enter
4. Suggestions from existing tags will appear
5. Maximum 10 tags per article

### Browsing Tags

Users can browse tags in two ways:
1. **Tag Cloud**: Visual representation with size based on usage
2. **Tag List**: Simple list with article counts

### Filtering by Tag

Click any tag badge to see all articles with that tag. Tags appear:
- On article cards in the home page
- On article detail pages
- In search results

### Admin Tag Management

Administrators can:
1. **Merge Tags**: Combine multiple tags into one
   - Select source tags to merge
   - Specify target tag name
   - All articles with source tags will be updated

2. **Delete Tags**: Remove a tag from all articles
   - Select tag to delete
   - Confirm deletion
   - Tag is removed from all articles

## API Reference

### GET /api/tags

Get all tags with article counts (only published articles).

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "tag": "glucose",
      "count": 15
    },
    {
      "tag": "liver",
      "count": 8
    }
  ]
}
```

### GET /api/tags/:tag/articles

Get articles by tag with pagination.

**Parameters:**
- `tag`: Tag name (URL encoded)
- `page`: Page number (default: 1)
- `limit`: Results per page (default: 10)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "...",
      "title": "Glucose Testing",
      "slug": "glucose-testing",
      "summary": "...",
      "category": "...",
      "tags": ["glucose", "blood-sugar"],
      "views": 100,
      "createdAt": "...",
      "updatedAt": "..."
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 15,
    "pages": 2
  }
}
```

### PUT /api/tags/merge

Merge multiple tags into one (admin only).

**Request Body:**
```json
{
  "sourceTags": ["old-tag-1", "old-tag-2"],
  "targetTag": "new-tag"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Merged 2 tags into \"new-tag\"",
  "updatedArticles": 12
}
```

### DELETE /api/tags/:tag

Delete a tag from all articles (admin only).

**Response:**
```json
{
  "success": true,
  "message": "Tag \"old-tag\" removed from 5 articles",
  "modifiedCount": 5
}
```

## Internationalization

All UI text is available in both Swedish (default) and English:

### Swedish Translations
- Taggar
- Lägg till tagg
- Populära taggar
- Artiklar taggade med
- Max X taggar
- And more...

### English Translations
- Tags
- Add Tag
- Popular Tags
- Articles tagged with
- Max X tags
- And more...

## Technical Implementation

### Database Schema

Tags are stored as an array of strings in the Article model:

```javascript
tags: [{
  type: String,
  lowercase: true,
  trim: true
}]
```

### Frontend State Management

Tag components use React hooks for state management:
- `useState` for local state
- `useEffect` for side effects
- `useRef` for DOM references

### Validation

Tags are validated at multiple levels:
1. **Client-side**: Max 10 tags, autocomplete suggestions
2. **Server-side**: Max 10 tags, lowercase normalization, trim whitespace

### Security

- Rate limiting should be implemented for tag API endpoints (see CodeQL warnings)
- Admin endpoints should be protected with authentication
- Input validation prevents malicious tag names

## Best Practices

1. **Tag Naming**
   - Use lowercase
   - Use hyphens for multi-word tags (e.g., "blood-sugar")
   - Keep tags concise and meaningful
   - Avoid redundant tags

2. **Tag Management**
   - Regularly review and merge similar tags
   - Remove unused or obsolete tags
   - Maintain consistent tag vocabulary

3. **Performance**
   - Tags are indexed for fast search
   - Pagination is used for tag article listings
   - Tag counts are aggregated efficiently

## Future Enhancements

Potential improvements for future versions:
1. Tag categories/hierarchies
2. Tag synonyms
3. Tag trending/analytics
4. Tag suggestions based on article content
5. User-specific tag collections
6. Export/import tag vocabulary

## Testing

Unit tests are provided for all tag components:
- `TagBadge.test.js`
- `TagInput.test.js`
- `TagCloud.test.js`
- `TagList.test.js`

Run tests with:
```bash
npm test -- --testPathPattern="Tag"
```

## Troubleshooting

### Tags not appearing
- Check article status (only published articles show tags publicly)
- Verify tags are saved in the database
- Check browser console for errors

### Autocomplete not working
- Ensure available tags are being fetched
- Check network tab for API errors
- Verify tags are properly normalized

### Admin functions not working
- Verify admin authentication
- Check API endpoint permissions
- Review server logs for errors

## Support

For issues or questions about the tags system, please refer to:
- GitHub Issues
- Project documentation
- Code comments in implementation files
