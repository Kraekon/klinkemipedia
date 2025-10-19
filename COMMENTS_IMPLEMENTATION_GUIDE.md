# Advanced Comments System - Implementation Guide

## Overview

This guide provides complete documentation for the advanced comments system implemented for Klinkemipedia. The system includes nested replies, voting, spam reporting, and admin moderation capabilities.

## Table of Contents

1. [Features](#features)
2. [Architecture](#architecture)
3. [API Endpoints](#api-endpoints)
4. [Frontend Components](#frontend-components)
5. [Usage Guide](#usage-guide)
6. [Admin Guide](#admin-guide)
7. [Configuration](#configuration)
8. [Testing](#testing)

## Features

### User Features
- ✅ Create, edit, and delete comments
- ✅ Nested replies (up to 5 levels deep)
- ✅ Upvote/downvote system
- ✅ Sort comments by newest, oldest, or top-rated
- ✅ Report spam or inappropriate comments
- ✅ Real-time character count (max 2000 characters)
- ✅ Edit history tracking (shows "edited" indicator)
- ✅ Responsive mobile design

### Admin Features
- ✅ Comment moderation dashboard
- ✅ Approve/reject comments
- ✅ Delete comments permanently
- ✅ View reported comments
- ✅ Filter by status (approved, pending, spam, deleted)
- ✅ Bulk actions support

### Security Features
- ✅ Authentication required for all actions
- ✅ Rate limiting to prevent abuse
- ✅ XSS prevention through HTML escaping
- ✅ Input validation and sanitization
- ✅ Ownership verification
- ✅ Spam detection via user reports

## Architecture

### Backend Structure

```
backend/
├── models/
│   ├── Comment.js          # Comment model with nested support
│   └── Article.js          # Updated with commentCount field
├── routes/
│   └── comments.js         # All comment-related routes
└── middleware/
    └── auth.js             # Authentication middleware (existing)
```

### Frontend Structure

```
src/
├── components/
│   ├── CommentSection.js       # Main container component
│   ├── CommentList.js          # List of comments
│   ├── CommentItem.js          # Single comment display
│   ├── CommentThread.js        # Nested replies wrapper
│   ├── CommentForm.js          # Create/edit form
│   ├── CommentVotes.js         # Voting UI
│   ├── CommentActions.js       # Action buttons
│   ├── ReportModal.js          # Report dialog
│   └── [ComponentName].css     # Corresponding styles
├── pages/
│   ├── ArticlePage.js          # Updated with CommentSection
│   └── AdminCommentModeration.js  # Admin moderation page
└── services/
    └── api.js                  # API service functions
```

## API Endpoints

### Public Endpoints

#### GET `/api/articles/:slug/comments`
Get all comments for an article.

**Query Parameters:**
- `sort` (optional): 'newest' | 'oldest' | 'top'

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "comment_id",
      "content": "Comment text",
      "userId": {
        "_id": "user_id",
        "username": "username"
      },
      "score": 5,
      "userVote": "upvote",
      "createdAt": "2024-01-01T00:00:00Z",
      "replies": []
    }
  ],
  "count": 10
}
```

### Authenticated Endpoints

#### POST `/api/articles/:slug/comments`
Create a new comment.

**Rate Limit:** 10 requests per 15 minutes

**Request Body:**
```json
{
  "content": "Comment text (max 2000 chars)"
}
```

#### PUT `/api/comments/:id`
Edit own comment.

**Rate Limit:** 10 requests per 15 minutes

**Request Body:**
```json
{
  "content": "Updated comment text"
}
```

#### DELETE `/api/comments/:id`
Delete own comment (soft delete).

**Rate Limit:** 60 requests per minute

#### POST `/api/comments/:id/reply`
Reply to a comment.

**Rate Limit:** 10 requests per 15 minutes

**Request Body:**
```json
{
  "content": "Reply text"
}
```

#### POST `/api/comments/:id/upvote`
Upvote a comment (toggle).

**Rate Limit:** 30 requests per minute

#### POST `/api/comments/:id/downvote`
Downvote a comment (toggle).

**Rate Limit:** 30 requests per minute

#### DELETE `/api/comments/:id/vote`
Remove vote.

**Rate Limit:** 30 requests per minute

#### POST `/api/comments/:id/report`
Report a comment.

**Rate Limit:** 5 requests per hour

**Request Body:**
```json
{
  "reason": "Report reason (max 500 chars)"
}
```

### Admin Endpoints

All admin endpoints require `protect` and `adminOnly` middleware.

#### GET `/api/admin/comments`
Get all comments with filters.

**Query Parameters:**
- `status` (optional): 'approved' | 'pending' | 'spam' | 'deleted'
- `page` (optional): Page number (default: 1)
- `limit` (optional): Results per page (default: 20, max: 100)

#### PUT `/api/admin/comments/:id/approve`
Approve a comment.

#### PUT `/api/admin/comments/:id/reject`
Reject a comment (mark as spam).

#### DELETE `/api/admin/comments/:id`
Permanently delete a comment and all its replies.

## Frontend Components

### CommentSection

Main container component that manages comment state and display.

**Props:**
- `articleSlug` (string, required): The article slug to load comments for

**Features:**
- Loads and displays comments
- Handles sorting
- Shows login prompt for non-authenticated users
- Provides comment form for authenticated users

### CommentItem

Displays a single comment with actions.

**Features:**
- Shows author, date, content
- Vote buttons
- Reply, edit, delete, report actions
- Nested reply form
- Edit mode

### CommentForm

Form for creating or editing comments.

**Props:**
- `articleSlug` (string): For new comments
- `commentId` (string): For editing
- `parentCommentId` (string): For replies
- `initialContent` (string): Pre-filled content
- `isEdit` (boolean): Edit mode flag
- `isReply` (boolean): Reply mode flag
- Various callback functions

### CommentVotes

Voting interface with upvote/downvote buttons.

**Features:**
- Shows current score
- Highlights user's vote
- Animated interactions
- Optimistic updates

### AdminCommentModeration

Admin dashboard for moderating comments.

**Features:**
- Filterable comment list
- Status badges
- Report count indicators
- Approve/reject/delete actions
- Pagination

## Usage Guide

### For End Users

#### Viewing Comments
1. Navigate to any article page
2. Scroll to the bottom to see the comments section
3. Use the sort dropdown to change comment order

#### Creating a Comment
1. Log in to your account
2. Navigate to an article
3. Type your comment in the text box (max 2000 characters)
4. Click "Post Comment"

#### Replying to Comments
1. Click the "Reply" button under any comment
2. Type your reply
3. Click "Reply" or "Cancel"
4. Replies are nested up to 5 levels

#### Voting
1. Click the up arrow (↑) to upvote
2. Click the down arrow (↓) to downvote
3. Click again to remove your vote
4. Login required

#### Editing Your Comments
1. Click "Edit" on your own comment
2. Modify the text
3. Click "Update" or "Cancel"
4. Comments show "(edited)" indicator after editing

#### Deleting Your Comments
1. Click "Delete" on your own comment
2. Confirm the deletion
3. Comment is soft-deleted but replies remain visible

#### Reporting Comments
1. Click "Report" on any comment (not your own)
2. Provide a reason for the report
3. Submit the report
4. Admins will review the report

### For Developers

#### Adding Comments to a New Page

```jsx
import CommentSection from '../components/CommentSection';

function MyPage() {
  const articleSlug = 'my-article-slug';
  
  return (
    <div>
      {/* Your page content */}
      <CommentSection articleSlug={articleSlug} />
    </div>
  );
}
```

#### Customizing Styles

Comment components use CSS modules. To customize:

1. Edit the corresponding `.css` file
2. Maintain the Atom theme color scheme:
   - Background: `#282C34`
   - Accent: `#5FB04B`
   - Text: `#ABB2BF`
   - Secondary: `#3E4451`

## Admin Guide

### Accessing the Moderation Dashboard

1. Log in as an admin user
2. Navigate to Admin panel
3. Click "Comments" in the navigation (💬 icon)

### Moderating Comments

#### Filtering Comments
- Use the status dropdown to filter by:
  - All Statuses
  - Approved
  - Pending
  - Spam
  - Deleted

#### Approving Comments
1. Find pending or spam comments
2. Click "Approve" button
3. Comment becomes visible to all users

#### Rejecting Comments
1. Find inappropriate comments
2. Click "Reject" button
3. Comment is marked as spam and hidden

#### Deleting Comments
1. Click "Delete" button on any comment
2. Confirm the permanent deletion
3. ⚠️ This deletes the comment AND all its replies
4. Cannot be undone

### Handling Reports

- Reported comments show a red badge with report count
- Review the reason(s) for reports
- Take appropriate action (approve, reject, or delete)
- Consider patterns in reports from specific users

### Best Practices

1. **Review Reports Daily**: Check for spam and inappropriate content
2. **Be Consistent**: Apply moderation rules fairly across all users
3. **Document Decisions**: Keep notes on why comments were removed
4. **Communicate**: Consider messaging users about removed content
5. **Monitor Patterns**: Watch for repeat offenders or spam campaigns

## Configuration

### Rate Limiting

Rate limits are configured in `backend/routes/comments.js`:

```javascript
// Adjust these values based on your needs
const commentCreateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Max 10 comments per window
});

const commentVoteLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 30, // Max 30 votes per window
});

const commentReportLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // Max 5 reports per window
});
```

### Comment Settings

In `backend/models/Comment.js`:

```javascript
// Maximum comment length
maxlength: [2000, 'Comment cannot be more than 2000 characters']

// Default status (can be 'approved' or 'pending')
default: 'approved'

// Auto-spam threshold
if (comment.reports.length >= 5) {
  comment.status = 'spam';
}
```

### Frontend Settings

In `src/components/CommentItem.js`:

```javascript
// Maximum reply depth
if (depth >= 4) {
  alert(t('comments.maxDepthReached'));
  return;
}
```

## Testing

### Running Tests

```bash
# Run all tests
npm test

# Run specific test file
npm test CommentForm.test.js

# Run tests in watch mode
npm test -- --watch
```

### Available Tests

- `CommentForm.test.js`: Tests for comment form component
  - Placeholder rendering
  - Character count
  - Submit button states
  - API integration

### Manual Testing Checklist

#### User Features
- [ ] Create a comment
- [ ] Edit your comment
- [ ] Delete your comment
- [ ] Reply to a comment
- [ ] Upvote/downvote comments
- [ ] Report a comment
- [ ] Sort comments
- [ ] View nested replies (5 levels)

#### Admin Features
- [ ] View all comments
- [ ] Filter by status
- [ ] Approve a comment
- [ ] Reject a comment
- [ ] Delete a comment
- [ ] View reported comments

#### Security
- [ ] Try to edit someone else's comment (should fail)
- [ ] Try to delete someone else's comment (should fail)
- [ ] Exceed rate limits (should be blocked)
- [ ] Try XSS injection in comment (should be escaped)

## Troubleshooting

### Comments Not Loading

**Issue**: Comments section shows loading spinner indefinitely

**Solutions**:
1. Check browser console for errors
2. Verify API endpoint is accessible
3. Check authentication status
4. Ensure article slug is correct

### Cannot Post Comments

**Issue**: Submit button is disabled or gives error

**Solutions**:
1. Ensure you're logged in
2. Check comment length (max 2000 chars)
3. Verify you haven't hit rate limit (10 per 15 min)
4. Check for validation errors in browser console

### Votes Not Updating

**Issue**: Vote buttons not responding

**Solutions**:
1. Ensure you're logged in
2. Check for rate limit (30 per minute)
3. Look for errors in browser console
4. Refresh the page

### Admin Actions Failing

**Issue**: Approve/reject/delete not working

**Solutions**:
1. Verify admin role in user profile
2. Check authentication token is valid
3. Look for authorization errors in console
4. Ensure comment exists and isn't already in target state

## Support

For issues or questions:
1. Check this documentation first
2. Review the security summary: `COMMENTS_SECURITY_SUMMARY.md`
3. Check GitHub issues for known problems
4. Create a new issue with:
   - Description of the problem
   - Steps to reproduce
   - Expected vs actual behavior
   - Browser and environment details

## License

Part of the Klinkemipedia project. See main LICENSE file for details.
