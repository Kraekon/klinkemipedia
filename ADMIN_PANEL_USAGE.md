# Admin Panel Usage Guide

## Accessing the Admin Panel

Navigate to: **http://localhost:3000/admin**

## Dashboard Features

### Article List
The dashboard displays all articles in a table with:
- **Title** - Article title with summary preview
- **Category** - Article category
- **Status** - Draft/Published badge
- **Views** - Number of views
- **Last Updated** - Last modification date
- **Actions** - Edit, View, Delete buttons

### Controls
- **Create New Article** - Large button at the top
- **Search** - Filter articles by title or category
- **Sort By** - Sort by: Last Updated, Created Date, Title, Category, Views
- **Order** - Ascending or Descending

### Actions
- **Edit** - Opens the article in edit mode
- **View** - Opens the article on the main site
- **Delete** - Shows confirmation modal before deleting

## Creating a New Article

1. Click **"Create New Article"** button
2. Fill in the form sections:

### Basic Information
- **Title** (required) - Slug auto-generates as you type
- **Category** (required) - Select from dropdown
- **Summary** (required) - 100-300 characters recommended
- **Content** (required) - Markdown supported
- **Preview** - Toggle to see how content will look

### Reference Ranges (Required)
- Click **"Add Range"** to add more rows
- Fill in: Parameter, Range, Unit, Age Group, Notes
- Cannot delete the last range
- Click **✕** to remove a range

### Clinical Information
- **Clinical Significance** - What abnormal values mean
- **Interpretation** - How to interpret results
- **Related Tests** - Type test name and press Enter to add

### Metadata
- **Tags** - Type and press Enter to add tags
- **References** - Add reference citations
- **Status** - Toggle between Draft and Published

### Form Actions
- **Cancel** - Return to dashboard without saving
- **Save as Draft** - Save with draft status
- **Publish** - Save with published status

## Editing an Article

1. Click **"Edit"** on any article in the dashboard
2. Modify any fields
3. Click **"Save as Draft"** or **"Publish"**

## Deleting an Article

1. Click **"Delete"** on any article
2. Confirm in the modal dialog
3. Article is permanently deleted

## Form Validation

The form validates:
- Title is required
- Category is required
- Summary is required
- Content is required
- At least one reference range with all fields filled

Validation errors appear in red below the fields.

## Tips

### Tags
- Existing tags appear as suggestions
- Tags display as blue chips
- Click ✕ on a chip to remove it
- Press Enter to add a new tag

### Related Tests
- Tests display as gray chips
- Click ✕ to remove
- Press Enter to add

### Slug
- Auto-generates from title
- Cannot be manually edited (in create mode)
- Safe for URLs (e.g., "Sodium (Na+)" → "sodium-na")

### References
- Add multiple reference citations
- Click ✕ to remove
- Click "+ Add Reference" for more

### Preview Mode
- Click "Show Preview" to see formatted content
- Preview shows title, category, summary, and content
- Click "Hide Preview" to return to editing

### Status
- **Draft** - Article not visible on main site
- **Published** - Article visible to all users

## Keyboard Shortcuts

- **Enter** in tag field → Add tag
- **Enter** in related test field → Add test

## Mobile Support

The admin panel is fully responsive:
- Tables scroll horizontally on small screens
- Form fields stack vertically
- Action buttons expand to full width

## Error Handling

If an error occurs:
- Red alert appears at the top
- Error message describes the issue
- Form data is preserved
- Fix the issue and try again

## Success Messages

After successful operations:
- Green alert appears at the top
- Confirmation message displays
- Automatically dismisses after 5 seconds

## Navigation

### Admin Navbar
- **Klinkemipedia Admin** - Logo/home
- **Dashboard** - Article list
- **New Article** - Create form
- **View Site** - Main site homepage

## API Integration

The admin panel uses these API endpoints:
- `GET /api/articles` - Fetch all articles
- `GET /api/articles/:slug` - Fetch single article
- `POST /api/articles` - Create new article
- `PUT /api/articles/:slug` - Update article
- `DELETE /api/articles/:slug` - Delete article
- `GET /api/articles/tags` - Get all tags

## Troubleshooting

### "Failed to load articles"
- Check backend is running on port 5001
- Check MongoDB is connected
- Check browser console for errors

### "Failed to save article"
- Check all required fields are filled
- Check reference ranges have all required fields
- Check network connection

### Slug conflicts
- If "slug already exists" error appears
- Modify the title slightly
- Slug will regenerate automatically

### Form doesn't submit
- Check for validation errors (red text)
- Fill in all required fields (marked with *)
- Ensure at least one complete reference range

## Best Practices

1. **Use descriptive titles** - Clear, concise article names
2. **Write good summaries** - 100-300 characters
3. **Complete reference ranges** - Always fill all fields
4. **Add relevant tags** - Helps with searching
5. **Use related tests** - Connects articles
6. **Add references** - Cite sources
7. **Save drafts often** - Don't lose work
8. **Preview before publishing** - Check formatting
9. **Use consistent categories** - Organize content
10. **Test after creating** - View article on main site

## Example Workflow

### Creating a Potassium Article

1. Click "Create New Article"
2. Enter title: "Potassium (K+)"
3. Slug auto-generates: "potassium-k"
4. Select category: "Electrolytes"
5. Enter summary: "Potassium is a crucial electrolyte..."
6. Enter content (markdown):
   ```
   ## Overview
   Potassium is essential for...
   
   ## Clinical Uses
   - Cardiac function
   - Muscle contraction
   ```
7. Add reference range:
   - Parameter: "Potassium"
   - Range: "3.5-5.0"
   - Unit: "mmol/L"
   - Age Group: "Adult"
8. Add clinical significance
9. Add related tests: "Sodium", "Chloride"
10. Add tags: "electrolytes", "cardiac", "nephrology"
11. Click "Preview" to check
12. Click "Publish"
13. Article appears in dashboard and main site!

## Security Note

Currently, the admin panel has no authentication. In production:
- Add user authentication
- Implement role-based access control
- Protect admin routes
- Add audit logging
