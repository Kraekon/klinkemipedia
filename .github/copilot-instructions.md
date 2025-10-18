# Copilot Instructions for Klinkemipedia

## Project Overview
Klinkemipedia is a medical encyclopedia web application for clinical laboratory information. It's built with:
- **Frontend**: React.js with React Router and React Bootstrap
- **Backend**: Node.js with Express
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT-based admin authentication

## Code Style & Standards

### General Principles
- Write clean, readable, and maintainable code
- Follow RESTful API conventions for backend endpoints
- Use semantic HTML and accessible UI components
- Prioritize user experience and performance

### React Components
- Use functional components with React Hooks
- Keep components focused and single-responsibility
- Create separate CSS files for component styles
- Use proper prop validation and default props
- Follow naming convention: PascalCase for components, camelCase for functions

### Backend APIs
- Follow REST conventions: GET, POST, PUT, DELETE
- Use descriptive endpoint names (e.g., `/api/articles`, `/api/auth/login`)
- Include proper error handling with meaningful messages
- Return consistent response formats with status codes
- Add input validation for all endpoints

### Testing
- Write comprehensive tests for all new features
- Use React Testing Library for component tests
- Mock API calls in tests
- Aim for high test coverage (80%+)
- Test both success and error scenarios

## Project Structure

```
src/
├── components/       # Reusable UI components (Navbar, Footer, etc.)
├── pages/           # Page components (HomePage, ArticlePage, SearchPage, etc.)
├── services/        # API service layer (api.js)
├── App.js           # Main app component with routing
└── index.js         # Entry point

server/
├── models/          # MongoDB models (Article, User)
├── routes/          # API route handlers
├── middleware/      # Auth middleware, error handlers
└── server.js        # Express server setup
```

## Key Features to Remember
- Articles have: title, summary, description, category, tags, referenceRanges, clinicalSignificance, relatedTests, views
- Admin authentication required for creating/editing/deleting articles
- Search functionality across article titles, content, and tags
- View count tracking for articles
- Related articles based on category and tags

## Best Practices

### When Creating Features
1. **Plan first**: Understand the full scope before coding
2. **Incremental changes**: Make small, focused commits
3. **Test thoroughly**: Write tests for new functionality
4. **Document**: Add comments for complex logic
5. **Responsive design**: Ensure mobile compatibility

### When Fixing Bugs
1. **Reproduce first**: Understand the issue completely
2. **Root cause**: Don't just fix symptoms
3. **Add tests**: Prevent regression
4. **Update documentation**: If behavior changes

### UI/UX Guidelines
- Use Bootstrap components for consistency
- Add loading states for async operations
- Show clear error messages to users
- Include breadcrumb navigation where appropriate
- Display view counts and metadata on articles
- Make search results clear and actionable

### Security Considerations
- Never expose sensitive data in frontend code
- Validate all user inputs on backend
- Use environment variables for secrets
- Implement proper authentication checks
- Sanitize data before database operations

## Common Patterns

### API Calls (Frontend)
```javascript
try {
  const response = await api.get('/api/articles');
  setData(response.data);
} catch (err) {
  setError('Failed to load data');
  console.error(err);
}
```

### Express Routes (Backend)
```javascript
router.get('/api/articles/:id', async (req, res) => {
  try {
    const article = await Article.findById(req.params.id);
    if (!article) return res.status(404).json({ message: 'Not found' });
    res.json(article);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});
```

### Component Structure
```javascript
function ComponentName() {
  const [state, setState] = useState(initialValue);
  
  useEffect(() => {
    // Side effects
  }, [dependencies]);
  
  const handleAction = () => {
    // Event handlers
  };
  
  return (
    <div>
      {/* JSX */}
    </div>
  );
}
```

## Optimization Goals
- Fast page loads (< 2 seconds)
- Smooth navigation and transitions
- Minimal bundle size
- Efficient database queries
- Proper caching where appropriate

## When Making PRs
- Include detailed descriptions of changes
- Add screenshots for UI changes
- List all modified files
- Note any breaking changes
- Include test results and coverage
- Add security scan results if applicable

## Quality Checklist
Before considering work complete, ensure:

- [ ] Code follows project conventions
- [ ] Tests written and passing
- [ ] No console errors or warnings
- [ ] Responsive on mobile and desktop
- [ ] Accessible (ARIA labels, keyboard navigation)
- [ ] Error handling implemented
- [ ] Loading states added
- [ ] Documentation updated
