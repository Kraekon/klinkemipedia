# Media Analytics - UI Mockups and Layouts

## Analytics Dashboard Layout

```
┌─────────────────────────────────────────────────────────────────┐
│  Klinkemipedia Admin                    Dashboard | New Article │
│  📊 Medieanalys  📁 Media Library  Users  View Site             │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                                                                   │
│  📊 Medieanalys                          [🔄 Uppdatera]         │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘

┌──────────────┬──────────────┬──────────────┬──────────────────┐
│      📷      │      💾       │      ✅      │       ⚠️         │
│     150      │   52.4 MB    │     120      │       30         │
│Total Bilder  │Totalt Lagr.. │Använda Bilder│Oanvända Bilder   │
│              │              │    (80%)     │   (20%) ⚠️       │
└──────────────┴──────────────┴──────────────┴──────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  Mest Använda Bilder                                            │
├────────┬──────────────┬────────────┬──────────┬────────────────┤
│  Bild  │   Filnamn    │Användningar│  Storlek │    Åtgärd      │
├────────┼──────────────┼────────────┼──────────┼────────────────┤
│ [IMG]  │ logo.png     │    ✅ 15   │ 124 KB   │ [Visa detaljer]│
│ [IMG]  │ banner.jpg   │    ✅ 12   │ 256 KB   │ [Visa detaljer]│
│ [IMG]  │ icon.svg     │    ✅ 10   │  12 KB   │ [Visa detaljer]│
│  ...   │     ...      │     ...    │   ...    │      ...       │
└────────┴──────────────┴────────────┴──────────┴────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  Oanvända Bilder                  [🗑️ Radera oanvända bilder]  │
│  30 bilder (15.2 MB)                                            │
├─────────────────────────────────────────────────────────────────┤
│  ⚠️ Dessa bilder används inte i någon artikel                  │
├─────────────────────────────────────────────────────────────────┤
│  ┌────────┐  ┌────────┐  ┌────────┐  ┌────────┐              │
│  │ [IMG]  │  │ [IMG]  │  │ [IMG]  │  │ [IMG]  │              │
│  │old.jpg │  │test.png│  │tmp.jpg │  │foo.png │              │
│  │ 256 KB │  │ 128 KB │  │ 512 KB │  │  64 KB │              │
│  │  ⚪ 0   │  │  ⚪ 0   │  │  ⚪ 0   │  │  ⚪ 0   │              │
│  └────────┘  └────────┘  └────────┘  └────────┘              │
│  ┌────────┐  ┌────────┐  ┌────────┐  ┌────────┐              │
│  │  ...   │  │  ...   │  │  ...   │  │  ...   │              │
│  └────────┘  └────────┘  └────────┘  └────────┘              │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  Största Bilder                                                 │
│  Potentiella kandidater för optimering                          │
├────────┬──────────────┬──────────┬──────────────┬──────────────┤
│  Bild  │   Filnamn    │  Storlek │  Dimensioner │    Åtgärd    │
├────────┼──────────────┼──────────┼──────────────┼──────────────┤
│ [IMG]  │ hero.jpg     │ ⚠️ 2.5 MB│ 3000 × 2000  │[Visa detaljer]│
│ [IMG]  │ photo.png    │ ⚠️ 1.8 MB│ 2400 × 1600  │[Visa detaljer]│
│ [IMG]  │ image.jpg    │   950 KB │ 1920 × 1080  │[Visa detaljer]│
│  ...   │     ...      │    ...   │     ...      │     ...      │
└────────┴──────────────┴──────────┴──────────────┴──────────────┘
```

## Media Detail Modal

```
┌─────────────────────────────────────────────────────────────┐
│  Bilddetaljer                                          [X]   │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│                    ┌─────────────────┐                     │
│                    │                 │                     │
│                    │   [  IMAGE  ]   │                     │
│                    │                 │                     │
│                    └─────────────────┘                     │
│                                                             │
│  Bildinformation                                            │
│  ─────────────────────────────────────────────────────────  │
│  Filnamn:        img-20241019-123456.jpg                   │
│  Original namn:  My Photo.jpg                              │
│  Storlek:        256 KB                                    │
│  Dimensioner:    1920 × 1080 px                            │
│  Uppladdad:      3 dagar sedan                             │
│  Uppladdad av:   admin                                     │
│  MIME-typ:       image/jpeg                                │
│                                                             │
│  Användningsinformation                                     │
│  ─────────────────────────────────────────────────────────  │
│  Antal användningar:  ✅ 5                                 │
│                                                             │
│  Används i artiklar:                                        │
│  • Article Title One                                        │
│  • Article Title Two                                        │
│  • Article Title Three                                      │
│  • Article Title Four                                       │
│  • Article Title Five                                       │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│  [📋 Kopiera URL]  [🗑️ Radera]              [Stäng]       │
└─────────────────────────────────────────────────────────────┘
```

## Confirm Modal (Bulk Delete)

```
┌──────────────────────────────────────────────┐
│  Bekräfta radering                      [X]  │
├──────────────────────────────────────────────┤
│                                              │
│  Är du säker på att du vill radera 30       │
│  oanvända bilder? Detta kan inte ångras.    │
│                                              │
│  ┌────────────────────────────────────────┐ │
│  │ ℹ️  Total storlek: 15.2 MB            │ │
│  └────────────────────────────────────────┘ │
│                                              │
├──────────────────────────────────────────────┤
│              [Avbryt]  [Radera]              │
└──────────────────────────────────────────────┘
```

## Empty State (No Unused Images)

```
┌─────────────────────────────────────────────────────────────┐
│  Oanvända Bilder                                            │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ ✅ Inga oanvända bilder hittades!                   │   │
│  │                                                     │   │
│  │ Alla bilder används i minst en artikel.            │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## Toast Notification Examples

```
┌────────────────────────────┐
│ ✅ URL kopierad till       │
│    urklipp                 │
└────────────────────────────┘

┌────────────────────────────┐
│ ✅ 30 bilder raderade!     │
└────────────────────────────┘

┌────────────────────────────┐
│ ❌ Något gick fel          │
└────────────────────────────┘
```

## Mobile Responsive Layout

### Statistics Cards (Stacked)

```
┌──────────────────┐
│       📷         │
│       150        │
│  Total Bilder    │
└──────────────────┘
┌──────────────────┐
│       💾         │
│     52.4 MB      │
│ Totalt Lagr...   │
└──────────────────┘
┌──────────────────┐
│       ✅         │
│       120        │
│ Använda Bilder   │
│      (80%)       │
└──────────────────┘
┌──────────────────┐
│       ⚠️         │
│        30        │
│ Oanvända Bilder  │
│   (20%) ⚠️       │
└──────────────────┘
```

### Most Used Images (Scrollable)

```
┌──────────────────────────┐
│ Mest Använda Bilder      │
├──────────────────────────┤
│ [IMG] logo.png           │
│ ✅ 15 | 124 KB           │
│ [Visa detaljer]          │
├──────────────────────────┤
│ [IMG] banner.jpg         │
│ ✅ 12 | 256 KB           │
│ [Visa detaljer]          │
├──────────────────────────┤
│        ...               │
└──────────────────────────┘
```

## Color Scheme

### Statistics Cards
- **Default Background**: White with subtle shadow
- **Warning Card** (>20% unused): Light yellow background (#fff3cd)
- **Icons**: Large, centered, 2rem size
- **Numbers**: Bold, h2 size
- **Labels**: Muted text color

### Badges
- **Success (Used)**: Green (#198754)
- **Secondary (Unused)**: Gray (#6c757d)
- **Warning (Large files)**: Orange (#ffc107)

### Buttons
- **Primary**: Blue for info/view actions
- **Danger**: Red for delete actions
- **Secondary**: Gray for cancel actions
- **Outline variants**: For less prominent actions

### Toast Notifications
- **Success**: Green background (#198754)
- **Danger**: Red background (#dc3545)
- **Info**: Blue background (#0dcaf0)
- **Warning**: Yellow background (#ffc107)

## Interaction Patterns

### Click Targets
1. **Statistics Cards**: Currently view-only (no click action)
2. **Image Thumbnails**: Click to open detail modal
3. **"Visa detaljer" buttons**: Click to open detail modal
4. **Article links**: Click to navigate to article page
5. **"Kopiera URL" button**: Click to copy, shows toast
6. **Delete buttons**: Click to show confirmation modal
7. **Bulk delete button**: Click to show confirmation with count

### Loading States
- **Spinners**: Center-aligned with "Laddar..." text
- **Button spinners**: Small spinner + button text
- **Skeleton loaders**: Could be added for progressive loading

### Hover Effects
- **Images**: Subtle shadow increase
- **Buttons**: Color darkening
- **Table rows**: Light gray background
- **Links**: Underline appears

## Accessibility Considerations

### Screen Readers
- Alt text on all images
- ARIA labels on icon-only buttons
- Proper heading hierarchy (h1 → h4)
- Descriptive link text

### Keyboard Navigation
- Tab order follows visual flow
- Enter/Space to activate buttons
- Escape to close modals
- Focus indicators visible

### Color Contrast
- Text meets WCAG AA standards
- Warning colors have sufficient contrast
- Icons supplement color coding

## Responsive Breakpoints

```
Mobile (xs):    < 576px  - Single column, stacked cards
Tablet (sm):    ≥ 576px  - 2 columns for stats
Tablet (md):    ≥ 768px  - 2 columns for unused grid
Desktop (lg):   ≥ 992px  - 3 columns for unused grid
Desktop (xl):   ≥ 1200px - 4 columns for unused grid, full tables
```

## Animation/Transitions

### Modal Animations
- Fade in/out: 200ms
- Scale up slightly on enter
- Backdrop fade: 150ms

### Button Animations
- Hover: 150ms ease
- Click: Scale down 95%
- Loading: Spinner rotation continuous

### Toast Animations
- Slide in from bottom-right: 300ms
- Auto-hide after 3s
- Fade out: 200ms

### Card Hover
- Shadow increase: 200ms ease
- Transform: translateY(-2px)

## Data Display Formats

### File Sizes
```
< 1 KB:      "512 B"
< 1 MB:      "256 KB"
< 1 GB:      "52.4 MB"
≥ 1 GB:      "1.2 GB"
```

### Dates (Swedish)
```
Today:       "Idag"
Yesterday:   "Igår"
< 7 days:    "3 dagar sedan"
< 30 days:   "2 veckor sedan"
< 365 days:  "3 månader sedan"
≥ 365 days:  "2024-01-15" (Swedish date format)
```

### Percentages
```
Always 1 decimal:  "80.0%"
Zero case:         "0.0%"
```

### Dimensions
```
With width/height:  "1920 × 1080 px"
Without:            "N/A"
```

## Error States

### No Data Available
```
┌─────────────────────────────────┐
│  ⚠️  Ingen data tillgänglig     │
└─────────────────────────────────┘
```

### Loading Error
```
┌──────────────────────────────────────┐
│  ❌ Fel vid laddning                 │
│                                      │
│  Något gick fel                      │
│                                      │
│  [Försök igen]                       │
└──────────────────────────────────────┘
```

### Network Error
```
┌──────────────────────────────────────┐
│  ❌ Kunde inte ladda användningsdata │
└──────────────────────────────────────┘
```

## Future Enhancement Ideas

### Storage Chart (Optional)
```
┌─────────────────────────────────────┐
│  Lagringsutrymme                    │
├─────────────────────────────────────┤
│                                     │
│        ┌─────────────┐             │
│        │     📊      │             │
│        │  Pie Chart  │             │
│        │  80% Used   │             │
│        │  20% Unused │             │
│        └─────────────┘             │
│                                     │
│  ━━━━━━━━━━━━━━━ 80% (42 MB)      │
│  ▬▬▬▬▬▬▬▬▬▬ 20% (10 MB)           │
│                                     │
└─────────────────────────────────────┘
```

### Filter Controls
```
┌─────────────────────────────────────┐
│  [Date Range ▼] [Size ▼] [Type ▼] │
└─────────────────────────────────────┘
```

### Export Button
```
[📥 Exportera CSV]
```
