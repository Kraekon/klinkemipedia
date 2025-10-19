# User Profiles & Gamification System Guide

## Overview

This guide documents the comprehensive user profiles and gamification system implemented for Klinkemipedia, including reputation points, badges, notifications, and social features.

## Features

### User Profiles

Users can create rich profiles with:
- **Avatar** - Profile picture (JPG, PNG, GIF up to 2MB)
- **Bio** - Personal description (max 500 characters)
- **Professional Information**
  - Specialty (e.g., "Hematology")
  - Institution (e.g., "Karolinska Hospital")
  - Location (e.g., "Stockholm, Sweden")
  - Website
- **Reputation Score** - Points earned through contributions
- **Badges** - Awards earned for achievements
- **Statistics**
  - Articles written
  - Articles edited
  - Comments posted
  - Upvotes received
  - Downvotes received
- **Social Features**
  - Followers
  - Following

### Reputation System

Users earn reputation points for various activities:

| Action | Points |
|--------|--------|
| Write article | +10 |
| Edit article (accepted) | +5 |
| Post comment | +1 |
| Comment upvoted | +2 |
| Comment downvoted | -1 |
| Article bookmarked | +1 |
| Receive follower | +5 |

Reputation is displayed prominently on user profiles and in the leaderboard.

### Badge System

#### Predefined Badges

1. **Contributor** (✍️) - Write your first article
2. **Prolific Writer** (📚) - Write 10 articles
3. **Expert** (🎓) - Reach 500 reputation points
4. **Master** (👑) - Reach 1000 reputation points
5. **Helpful** (🤝) - Receive 50 comment upvotes
6. **Veteran** (⭐) - 1 year membership
7. **Moderator** (🛡️) - Awarded by admin
8. **Community Leader** (🌟) - Gain 100 followers

#### Badge Types

- **Auto** - Automatically awarded when criteria are met
- **Admin** - Manually awarded by administrators

### Notifications

Users receive real-time notifications for:
- **Comment Reply** - When someone replies to your comment
- **Mention** - When someone mentions you (@username)
- **Upvote** - When your comment receives an upvote
- **Badge Earned** - When you earn a new badge
- **New Follower** - When someone follows you

Notifications appear in the bell icon dropdown in the navbar with:
- Unread count badge
- Real-time updates (polls every 30 seconds)
- Mark as read functionality
- Link to relevant content

### Leaderboard

The leaderboard showcases top contributors with filtering options:

**Period Filters:**
- All-time
- This month
- This week

**Category Filters:**
- By Reputation
- By Articles (most articles written)
- By Helpfulness (most comment upvotes)

**Features:**
- Top 3 highlighted with gold, silver, bronze
- Pagination (50 users per page)
- Displays user avatar, badges, and score

### Social Features

#### Follow System
- Follow/unfollow other users
- View followers and following lists
- Receive notifications for new followers
- Award reputation points when gaining followers

#### User Activity
Each profile displays:
- List of articles written
- Recent comments
- Followers list with UserCard component
- Following list with UserCard component

## API Endpoints

### User Profile Routes

```
GET    /api/users/profile/:username          - Get user profile (public)
PUT    /api/users/profile                    - Update own profile (auth)
POST   /api/users/avatar                     - Upload avatar (auth)
PUT    /api/users/password                   - Change password (auth)
POST   /api/users/:id/follow                 - Follow user (auth)
DELETE /api/users/:id/follow                 - Unfollow user (auth)
GET    /api/users/profile/:username/activity - Get user activity (public)
GET    /api/users/profile/:username/followers - Get user followers (public)
GET    /api/users/profile/:username/following - Get user following (public)
GET    /api/users/leaderboard                - Get leaderboard (public)
```

### Notification Routes

```
GET    /api/notifications              - Get user notifications (auth)
PUT    /api/notifications/:id/read     - Mark notification as read (auth)
PUT    /api/notifications/read-all     - Mark all as read (auth)
DELETE /api/notifications/:id          - Delete notification (auth)
```

### Badge Routes

```
GET  /api/badges                            - Get all badges (public)
POST /api/badges/admin                      - Create badge (admin)
POST /api/badges/admin/:badgeId/award/:userId - Award badge (admin)
```

## Frontend Components

### Pages
- **ProfilePage** (`/profile/:username`) - User profile view
- **EditProfilePage** (`/profile/edit`) - Edit own profile
- **LeaderboardPage** (`/leaderboard`) - Top contributors

### Components
- **NotificationsDropdown** - Bell icon with notification dropdown
- **UserCard** - Reusable user info card
- **FollowButton** - Follow/unfollow toggle button

## Usage

### Seeding Badges

Run the badge seeding script to populate predefined badges:

```bash
cd backend
node scripts/seedBadges.js
```

### Awarding Reputation

Use the utility function in your code:

```javascript
const { awardReputation } = require('../utils/reputation');

// Award 10 points for writing an article
await awardReputation(userId, 10, 'Article published');
```

### Creating Notifications

```javascript
const { createNotification } = require('../utils/reputation');

await createNotification({
  userId: targetUserId,
  type: 'comment_reply',
  title: 'New Reply',
  message: `${user.username} replied to your comment`,
  link: `/article/${articleSlug}`
});
```

### Checking and Awarding Badges

Badges are automatically checked after reputation changes, but you can manually trigger:

```javascript
const { checkAndAwardBadges } = require('../utils/reputation');

await checkAndAwardBadges(userId);
```

## Security

- Avatar uploads limited to 2MB, JPG/PNG/GIF only
- Rate limiting on follow actions (10 per minute)
- Authentication required for profile edits, password changes
- XSS prevention with input sanitization
- Password change requires current password verification

## Styling

All components use the Atom dark theme:
- Dark background (#282c34)
- Green accents (#98c379) for primary actions
- Blue (#61afef) for links
- Gray text (#abb2bf, #5c6370)
- Hover effects and transitions

## i18n Support

Full translations provided in:
- Swedish (`src/locales/sv/translation.json`)
- English (`src/locales/en/translation.json`)

Keys include:
- `profile.*` - Profile-related translations
- `leaderboard.*` - Leaderboard translations
- `notifications.*` - Notification translations
- `badges.*` - Badge names and descriptions

## Future Enhancements

Potential additions to consider:
- Achievement system with progress tracking
- User statistics dashboard
- Customizable profile themes
- Activity feed on homepage
- Direct messaging between users
- Team/group features
- Export user contributions
- API rate limiting per user tier
- Premium badges for donors/supporters
