# Authentication UI Showcase

This document describes the visual appearance and user interface of the authentication system.

## Color Scheme (Atom Theme)

- **Background**: Linear gradient from #1e1e1e to #2d2d2d
- **Cards**: #2d2d2d with #3d3d3d border
- **Primary Text**: #ffffff (white)
- **Secondary Text**: #b0b0b0 (light gray)
- **Input Background**: #1e1e1e
- **Input Border**: #3d3d3d
- **Focus Border**: #5FB04B (green) with glow
- **Primary Button**: #5FB04B (green)
- **Button Hover**: #4a9a38 (darker green)
- **Error Text**: #ff6b6b (red)
- **Success Text**: #5FB04B (green)

## Login Page

### Layout
```
┌────────────────────────────────────────────────┐
│                                                │
│  ┌──────────────────────────────────────────┐ │
│  │                                          │ │
│  │         Login to Klinkemipedia          │ │
│  │                                          │ │
│  │  ┌────────────────────────────────────┐ │ │
│  │  │ Email                              │ │ │
│  │  │ [user@example.com              ] │ │ │
│  │  └────────────────────────────────────┘ │ │
│  │                                          │ │
│  │  ┌────────────────────────────────────┐ │ │
│  │  │ Password                           │ │ │
│  │  │ [••••••                        ] │ │ │
│  │  └────────────────────────────────────┘ │ │
│  │                                          │ │
│  │  ┌────────────────────────────────────┐ │ │
│  │  │         [ Login ]                  │ │ │
│  │  └────────────────────────────────────┘ │ │
│  │                                          │ │
│  │  Don't have an account?                 │ │
│  │  Register here                          │ │
│  │                                          │ │
│  └──────────────────────────────────────────┘ │
│                                                │
└────────────────────────────────────────────────┘
```

### Features
- **Card Design**: Centered, rounded corners, subtle shadow
- **Labels**: Light gray (#b0b0b0), above inputs
- **Inputs**: 
  - Dark background (#1e1e1e)
  - Light text (#ffffff)
  - Placeholder in gray (#666666)
  - Green focus ring when active
- **Button**: 
  - Full-width green (#5FB04B)
  - Hover effect: darker green + slight lift
  - Loading state: "Logging in..." with opacity
- **Links**: Green (#5FB04B) text for "Register here"
- **Error Messages**: Red (#ff6b6b) alert box at top

## Register Page

### Layout
```
┌────────────────────────────────────────────────┐
│                                                │
│  ┌──────────────────────────────────────────┐ │
│  │                                          │ │
│  │           Create Account                │ │
│  │                                          │ │
│  │  ┌────────────────────────────────────┐ │ │
│  │  │ Username                           │ │ │
│  │  │ [Username                      ] │ │ │
│  │  └────────────────────────────────────┘ │ │
│  │                                          │ │
│  │  ┌────────────────────────────────────┐ │ │
│  │  │ Email                              │ │ │
│  │  │ [user@example.com              ] │ │ │
│  │  └────────────────────────────────────┘ │ │
│  │                                          │ │
│  │  ┌────────────────────────────────────┐ │ │
│  │  │ Password                           │ │ │
│  │  │ [••••••                        ] │ │ │
│  │  └────────────────────────────────────┘ │ │
│  │                                          │ │
│  │  ┌────────────────────────────────────┐ │ │
│  │  │ Confirm Password                   │ │ │
│  │  │ [••••••                        ] │ │ │
│  │  └────────────────────────────────────┘ │ │
│  │                                          │ │
│  │  ┌────────────────────────────────────┐ │ │
│  │  │        [ Register ]                │ │ │
│  │  └────────────────────────────────────┘ │ │
│  │                                          │ │
│  │  Already have an account?               │ │
│  │  Login here                             │ │
│  │                                          │ │
│  └──────────────────────────────────────────┘ │
│                                                │
└────────────────────────────────────────────────┘
```

### Features
- Same styling as Login page
- Four input fields instead of two
- Real-time validation feedback:
  - Red border + error message for invalid fields
  - Green border for valid fields (optional)
- Auto-login after successful registration

## Navbar - Logged Out State

```
┌────────────────────────────────────────────────────────────────┐
│ Klinkemipedia  Home Articles Tags About  [Search]  🌐  [Login] [Register] │
└────────────────────────────────────────────────────────────────┘
```

- **Login button**: Outline style, white border
- **Register button**: Solid green (#5FB04B)
- **Language switcher**: Globe icon (🌐)

## Navbar - Logged In State

```
┌────────────────────────────────────────────────────────────────┐
│ Klinkemipedia  Home Articles Tags About  [Search]  🌐  👤 username ▼ │
└────────────────────────────────────────────────────────────────┘
```

## User Menu Dropdown

When clicking the username:

```
         ┌─────────────────────────┐
         │  user@example.com       │
         │  USER                   │  
         ├─────────────────────────┤
         │  Logout                 │
         └─────────────────────────┘
```

For admin users:

```
         ┌─────────────────────────┐
         │  admin@example.com      │
         │  ADMIN                  │  
         ├─────────────────────────┤
         │  Admin                  │
         ├─────────────────────────┤
         │  Logout                 │
         └─────────────────────────┘
```

### Dropdown Features
- **Header**: Email (gray) + Role (green for admin/user)
- **Menu items**: Gray text, darker background on hover
- **Logout**: Red text (#ff6b6b), red-tinted hover
- **Admin link**: Standard menu item styling

## Protected Route - Loading State

```
┌────────────────────────────────────┐
│                                    │
│     🔐 Checking authentication...  │
│                                    │
└────────────────────────────────────┘
```

## Protected Route - Access Denied (Non-Admin)

```
┌────────────────────────────────────┐
│                                    │
│          🚫 Access Denied          │
│   Admin privileges required        │
│                                    │
└────────────────────────────────────┘
```

## Form Validation States

### Valid Input
```
┌────────────────────────┐
│ Email                  │
│ [user@example.com  ]  │ ← Green border (#5FB04B)
└────────────────────────┘
```

### Invalid Input
```
┌────────────────────────┐
│ Email                  │
│ [invalid-email      ]  │ ← Red border (#dc3545)
│ Please enter a valid   │ ← Red error text
│ email address          │
└────────────────────────┘
```

### Focus State
```
┌────────────────────────┐
│ Password               │
│ [••••••             ]  │ ← Green border + glow
└────────────────────────┘
```

## Error Alert Box

```
┌─────────────────────────────────────────┐
│ ⚠️ Invalid email or password            │ ← Red background
└─────────────────────────────────────────┘
```

## Responsive Design

### Desktop (>768px)
- Centered card with max-width 450px
- Full padding and spacing
- Hover effects on buttons

### Mobile (<768px)
- Full-width card with minimal padding
- Touch-friendly button sizes
- No hover effects (tap-based)
- Stacked layout for all elements

## Animation Effects

### Button Hover
- Color change: #5FB04B → #4a9a38
- Transform: translateY(-1px)
- Shadow: 0 4px 8px rgba(95, 176, 75, 0.3)

### Button Click
- Transform: translateY(0)
- Immediate feedback

### Loading State
- Button opacity: 0.7
- Cursor: not-allowed
- Text: "Logging in..." or "Creating account..."

## Accessibility Features

- **Form labels**: Properly associated with inputs
- **Placeholders**: Helpful examples
- **Error messages**: Clear, descriptive
- **Focus states**: Visible green ring
- **ARIA labels**: For search buttons
- **Keyboard navigation**: Full tab support
- **Color contrast**: WCAG AA compliant

## Language Toggle

All text elements respond to language selection:

### English
- "Login to Klinkemipedia"
- "Don't have an account? Register here"
- "Invalid email or password"

### Swedish  
- "Logga in på Klinkemipedia"
- "Har du inget konto? Registrera här"
- "Ogiltig e-post eller lösenord"

## Theme Consistency

The authentication UI matches the Atom theme used throughout the application:
- Dark backgrounds
- Green accents for primary actions
- Clean, modern design
- Consistent spacing and typography
- Professional appearance suitable for medical wiki

## User Experience Highlights

1. **Clear Visual Hierarchy**: Titles, labels, inputs, buttons clearly organized
2. **Helpful Feedback**: Validation messages guide users
3. **Consistent Styling**: Matches rest of application
4. **Smooth Animations**: Subtle hover and transition effects
5. **Mobile-Friendly**: Fully responsive on all devices
6. **Accessible**: Keyboard navigation and screen reader support
7. **Bilingual**: Seamless Swedish/English switching
8. **Professional**: Clean design appropriate for medical context

## Form States Summary

| State | Border Color | Background | Text Color | Feedback |
|-------|-------------|------------|------------|----------|
| Default | #3d3d3d | #1e1e1e | #ffffff | - |
| Focus | #5FB04B | #1e1e1e | #ffffff | Green glow |
| Valid | #5FB04B | #1e1e1e | #ffffff | - |
| Invalid | #dc3545 | #1e1e1e | #ffffff | Red error text |
| Disabled | #3d3d3d | #1e1e1e | #666666 | Reduced opacity |
| Loading | #3d3d3d | #1e1e1e | #ffffff | Loading text |

This comprehensive UI design ensures a smooth, secure, and professional authentication experience for all Klinkemipedia users.
