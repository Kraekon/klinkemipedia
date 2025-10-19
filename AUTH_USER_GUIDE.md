# User Authentication Guide

This guide explains how to use the JWT-based authentication system in Klinkemipedia.

## For End Users

### Creating an Account

1. Click the **"Register"** button in the navbar
2. Fill in the registration form:
   - **Username**: 3-20 characters, unique
   - **Email**: Valid email address, unique
   - **Password**: Minimum 6 characters
   - **Confirm Password**: Must match password
3. Click **"Register"**
4. You'll be automatically logged in and redirected to the home page

### Logging In

1. Click the **"Login"** button in the navbar
2. Enter your email and password
3. Click **"Login"**
4. You'll be redirected to the page you were trying to access, or the home page

### Logging Out

1. Click on your username in the navbar (top-right)
2. Select **"Logout"** from the dropdown menu
3. You'll be logged out and the navbar will show Login/Register buttons again

### User Menu

When logged in, click your username in the navbar to access:
- Your email and role
- **Admin** link (if you're an admin)
- **Logout** option

## For Developers

### Using the AuthContext

```javascript
import { useAuth } from '../contexts/AuthContext';

function MyComponent() {
  const { user, isAuthenticated, isAdmin, login, logout, register } = useAuth();
  
  if (!isAuthenticated) {
    return <div>Please log in</div>;
  }
  
  return (
    <div>
      <p>Welcome, {user.username}!</p>
      {isAdmin && <p>You are an admin</p>}
    </div>
  );
}
```

### Protecting Routes

#### Basic Protection (Requires Login)

```javascript
import ProtectedRoute from './components/ProtectedRoute';

<Route path="/profile" element={
  <ProtectedRoute>
    <ProfilePage />
  </ProtectedRoute>
} />
```

#### Admin-Only Protection

```javascript
<Route path="/admin" element={
  <ProtectedRoute requireAdmin={true}>
    <AdminPage />
  </ProtectedRoute>
} />
```

### Making Authenticated API Requests

The `axios` instance in `services/api.js` is already configured with `withCredentials: true`, so cookies are automatically sent with all requests.

```javascript
import axios from 'axios';

// Cookies are automatically included
const response = await axios.get('/api/auth/me');
```

### Backend API Endpoints

#### Public Endpoints

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user

#### Protected Endpoints

- `GET /api/auth/me` - Get current user info (requires authentication)

### Using Authentication Middleware

#### Protect Any Route

```javascript
const { protect } = require('./middleware/auth');

router.get('/profile', protect, async (req, res) => {
  // req.user is available
  res.json({ user: req.user });
});
```

#### Admin-Only Routes

```javascript
const { protect, adminOnly } = require('./middleware/auth');

router.delete('/users/:id', protect, adminOnly, async (req, res) => {
  // Only admins can access this
  // req.user is available and req.user.role === 'admin'
});
```

## Language Support

All authentication UI supports both Swedish and English:

### English
- Login / Register
- Email / Password
- Error messages in English

### Swedish  
- Logga in / Registrera
- E-post / Lösenord
- Error messages in Swedish

Language automatically switches based on user preference or browser settings.

## Styling

The authentication pages use the Atom theme with:
- Dark background (#1e1e1e, #2d2d2d)
- Green accent color (#5FB04B)
- Clean, modern card-based design
- Fully responsive

## Error Handling

The system provides clear error messages for:
- Invalid email format
- Password too short
- Username too short/long
- Passwords don't match
- Email already registered
- Username already taken
- Invalid credentials
- Server errors

## Security Features

- Passwords are never stored in plain text (bcrypt hashing)
- JWT tokens in HTTP-only cookies (can't be accessed by JavaScript)
- Automatic token expiration (7 days)
- Secure cookies in production (HTTPS only)
- CSRF protection (SameSite cookies)
- Role-based access control

## Testing Authentication

### Manual Testing Checklist

1. **Registration**
   - [ ] Can create account with valid data
   - [ ] Cannot create account with duplicate email
   - [ ] Cannot create account with duplicate username
   - [ ] Cannot create account with invalid email
   - [ ] Cannot create account with short password
   - [ ] Auto-login after successful registration

2. **Login**
   - [ ] Can login with valid credentials
   - [ ] Cannot login with invalid email
   - [ ] Cannot login with invalid password
   - [ ] Redirected to intended page after login
   - [ ] Login state persists across page refresh

3. **Protected Routes**
   - [ ] Cannot access admin routes without login
   - [ ] Cannot access admin routes with non-admin user
   - [ ] Can access admin routes with admin user
   - [ ] Redirected to login when accessing protected route while logged out

4. **Logout**
   - [ ] Can logout successfully
   - [ ] Cannot access protected routes after logout
   - [ ] Login button appears after logout

5. **UI/UX**
   - [ ] Login/Register buttons show when logged out
   - [ ] User menu shows when logged in
   - [ ] Translations work in both languages
   - [ ] Styling matches Atom theme
   - [ ] Forms are responsive on mobile

## Troubleshooting

### "Not authorized" errors
- Make sure you're logged in
- Check that your token hasn't expired (7 days)
- Try logging out and logging back in

### "Email already registered"
- Try logging in instead
- Use the password reset feature (if implemented)

### CORS errors in development
- Make sure backend `FRONTEND_URL` env variable is set to `http://localhost:3000`
- Check that `withCredentials: true` is set in axios config

### Cookies not being sent
- Check that `axios.defaults.withCredentials = true` is set
- Verify backend CORS is configured with `credentials: true`
- In production, ensure HTTPS is enabled for secure cookies

## Environment Variables

### Backend (.env)
```bash
JWT_SECRET=your-secret-key-here
JWT_EXPIRE=7d
FRONTEND_URL=http://localhost:3000
NODE_ENV=development
```

### Frontend (.env or .env.local)
```bash
REACT_APP_API_URL=http://localhost:5001/api
```
