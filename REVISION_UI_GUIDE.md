# Article Revision History - User Interface Guide

## UI Components Overview

This guide describes the user interface components for the Article Revision History feature.

## 1. Article Detail Page - View History Button

### Location
- Article detail page (public view)
- Top-right corner next to the "Back to Articles" button

### Appearance
```
┌─────────────────────────────────────────────────────────┐
│ [← Back to Articles]              [📜 View History]     │
└─────────────────────────────────────────────────────────┘
```

### Functionality
- Accessible to all users (not just admins)
- Opens the Version History modal
- Shows all revisions of the article
- Translated: "View History" (EN) / "Visa historik" (SV)

## 2. Version History Modal

### Header
```
┌───────────────────────────────────────────────────────────┐
│ Revision History                                      [X] │
└───────────────────────────────────────────────────────────┘
```

### Main View - Revision List
```
┌───────────────────────────────────────────────────────────┐
│ [Compare Versions] or [Cancel Compare] [Compare Selected]│
│ Select 2 versions to compare (0/2 selected)              │
├───────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────┐ │
│ │ [ ] │ v5 │ 2024-10-19 14:30 │ admin │ Fixed typo │ │
│ │     │    │                  │       │ [View]     │ │
│ ├─────────────────────────────────────────────────────┤ │
│ │ [ ] │ v4 │ 2024-10-19 12:15 │ admin │ Updated   │ │
│ │     │    │                  │       │ ranges    │ │
│ │     │    │                  │       │ [View]     │ │
│ ├─────────────────────────────────────────────────────┤ │
│ │ [ ] │ v3 │ 2024-10-18 09:45 │ user1 │ No desc   │ │
│ │     │    │                  │       │ [View]     │ │
│ └─────────────────────────────────────────────────────┘ │
│                                                           │
│              [< Previous] 1 2 3 [Next >]                  │
└───────────────────────────────────────────────────────────┘
```

### Features
- **Table Columns**:
  - Checkbox (when in compare mode)
  - Version number (badge)
  - Date/time (relative or absolute)
  - Editor username
  - Change description (or "No description")
  - Actions (View button)

- **Compare Mode**:
  - Toggle with "Compare Versions" button
  - Select up to 2 versions with checkboxes
  - "Compare Selected" button appears when 2 selected
  - Opens comparison in new tab

- **Pagination**:
  - Shows when more than 20 revisions
  - First, Previous, Page numbers, Next, Last

## 3. Version Detail View

When clicking "View" on a revision:

```
┌───────────────────────────────────────────────────────────┐
│ Version 3                                             [X] │
├───────────────────────────────────────────────────────────┤
│ Edited by user1 on 2 days ago                             │
│                                                           │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ ℹ Change Description: Updated reference ranges      │ │
│ └─────────────────────────────────────────────────────┘ │
│                                                           │
│ Title                                                     │
│ Sodium (Na+)                                              │
│                                                           │
│ Category                                                  │
│ Electrolytes                                              │
│                                                           │
│ Summary                                                   │
│ Essential electrolyte for body function...                │
│                                                           │
│ Content                                                   │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ # Sodium                                            │ │
│ │                                                     │ │
│ │ Sodium is an essential electrolyte...              │ │
│ │ (scrollable content)                               │ │
│ └─────────────────────────────────────────────────────┘ │
│                                                           │
│ Status                                                    │
│ [published]                                               │
│                                                           │
│ [Back to List]              [Restore This Version]        │
└───────────────────────────────────────────────────────────┘
```

### Features
- Read-only view of historical version
- Shows all article fields
- "Back to List" returns to revision list
- "Restore This Version" (admin only) with confirmation
- Scrollable content area for long articles

## 4. Version Comparison View

Opens in new tab at `/admin/articles/:slug/compare?v1=3&v2=5`

```
┌───────────────────────────────────────────────────────────┐
│ [Admin Navbar]                                            │
├───────────────────────────────────────────────────────────┤
│ Version Comparison                                        │
│ Comparing version 3 with version 5                        │
│                                                           │
│ [⚠ Yellow background = Changed field]                    │
│ [⬜ Gray = Unchanged field]                               │
├───────────────────────────────────────────────────────────┤
│                                                           │
│ ╔════════════════════════════════════════════════════╗   │
│ ║ Title                                   (Changed) ║   │
│ ╠══════════════════════════╦═════════════════════════╣   │
│ ║ Version 3                ║ Version 5               ║   │
│ ║ Sodium (Na+)             ║ Sodium (Na⁺)            ║   │
│ ╚══════════════════════════╩═════════════════════════╝   │
│                                                           │
│ ┌────────────────────────────────────────────────────┐   │
│ │ Category                              (Unchanged) │   │
│ ├──────────────────────────┬─────────────────────────┤   │
│ │ Version 3                │ Version 5               │   │
│ │ Electrolytes             │ Electrolytes            │   │
│ └──────────────────────────┴─────────────────────────┘   │
│                                                           │
│ ╔════════════════════════════════════════════════════╗   │
│ ║ Summary                                 (Changed) ║   │
│ ╠══════════════════════════╦═════════════════════════╣   │
│ ║ Version 3                ║ Version 5               ║   │
│ ║ Essential electrolyte... ║ Sodium is essential...  ║   │
│ ╚══════════════════════════╩═════════════════════════╝   │
│                                                           │
│ (continues for all fields...)                             │
│                                                           │
│                    [Close]                                │
└───────────────────────────────────────────────────────────┘
```

### Features
- Side-by-side comparison of two versions
- Yellow/warning background for changed fields
- Gray/neutral background for unchanged fields
- Version badges on each column
- All fields compared:
  - Title, Category, Summary
  - Content (full text)
  - Status
  - Clinical Significance, Interpretation
  - Tags, Related Tests
  - References, Reference Ranges
  - Images

## 5. Admin Article Form - Change Description

In edit mode only:

```
┌───────────────────────────────────────────────────────────┐
│ Edit Article                            [📜 Version History]│
├───────────────────────────────────────────────────────────┤
│ ...existing form fields...                                │
│                                                           │
│ Change Description (Optional)                             │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ Updated reference ranges with latest guidelines     │ │
│ └─────────────────────────────────────────────────────┘ │
│ Help others understand what changed (max 200 chars)      │
│                                                           │
│ Status                                                    │
│ [✓] Published                                            │
│                                                           │
│ [Cancel]            [Save Draft]    [Publish Now]         │
└───────────────────────────────────────────────────────────┘
```

### Features
- Only shown when editing existing articles
- Optional field (not required)
- 200 character limit
- Helpful hint text below
- Saved with the revision
- Cleared after article load

## 6. Responsive Design

All components are responsive and work on:
- Desktop (full width, side-by-side comparison)
- Tablet (stacked columns for comparison)
- Mobile (vertical layout, scrollable tables)

## 7. Language Support

All UI text supports both languages:

### English
- "View History"
- "Version History"
- "Compare Versions"
- "Restore This Version"
- "Change Description"
- "Edited by X on Y"

### Swedish
- "Visa historik"
- "Versionshistorik"
- "Jämför versioner"
- "Återställ denna version"
- "Ändringsbeskrivning"
- "Redigerad av X den Y"

## 8. Loading States

All components show loading indicators:
- Spinner with "Loading revisions..." / "Laddar versioner..."
- Spinner with "Loading comparison..." / "Laddar jämförelse..."
- Disabled buttons during restore operations
- "Restoring..." / "Återställer..." button text

## 9. Error States

User-friendly error messages:
- "Failed to load revisions"
- "Failed to restore revision"
- "Failed to compare versions"
- Red alert banners with close button

## 10. Empty States

When no revisions exist:
```
┌───────────────────────────────────────────────────────────┐
│ ℹ No revision history available yet.                      │
│   Revisions will be created when you edit the article.    │
└───────────────────────────────────────────────────────────┘
```

## Color Scheme

- **Primary**: Bootstrap primary blue (#0d6efd)
- **Success**: Green badges for published status
- **Warning**: Yellow background for changed fields
- **Secondary**: Gray for unchanged fields
- **Info**: Blue alerts for informational messages
- **Danger**: Red alerts for errors

## Icons

- 📜 - Version history (document scroll emoji)
- ✓ - Checkmarks for selection
- ⚠ - Warning indicator for changed fields
- ⬜ - Placeholder for unchanged fields
- ℹ - Information indicator

## Accessibility

- Semantic HTML elements
- ARIA labels where needed
- Keyboard navigation support
- High contrast for readability
- Screen reader friendly

## Animation

- Smooth modal transitions
- Fade-in for content loading
- Hover states on buttons and rows
- Responsive click feedback
