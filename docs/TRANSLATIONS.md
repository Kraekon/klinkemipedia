# Translation Management Guide

This document provides guidelines for managing translations in the Klinkemipedia application.

## Overview

Klinkemipedia uses **react-i18next** for internationalization (i18n). The application supports:
- **Swedish (sv)** - Default language
- **English (en)** - Secondary language

## File Structure

```
src/
├── i18n.js                    # i18n configuration
└── locales/
    ├── en/
    │   └── translation.json   # English translations
    └── sv/
        └── translation.json   # Swedish translations
```

## Translation Files

Translation files are organized using nested JSON objects for better maintainability:

```json
{
  "common": {
    "loading": "Loading...",
    "save": "Save",
    "cancel": "Cancel"
  },
  "navigation": {
    "home": "Home",
    "articles": "Articles"
  }
}
```

### Key Categories

- **common** - Shared terms (buttons, actions, states)
- **navigation** - Navigation labels and menu items
- **article** - Article-related text
- **user** - User management text
- **media** - Media library text
- **search** - Search functionality text
- **form** - Form labels and validation messages
- **messages** - Success/error/warning messages
- **page** - Page-specific content
- **date** - Date and time formatting
- **sort** - Sorting options
- **filter** - Filter options
- **table** - Table headers and content
- **button** - Button labels

## Adding New Translations

### Step 1: Add to English Translation File

Edit `src/locales/en/translation.json`:

```json
{
  "category": {
    "newKey": "New English Text"
  }
}
```

### Step 2: Add to Swedish Translation File

Edit `src/locales/sv/translation.json`:

```json
{
  "category": {
    "newKey": "Ny svensk text"
  }
}
```

### Step 3: Use in Component

```javascript
import { useTranslation } from 'react-i18next';

function MyComponent() {
  const { t } = useTranslation();
  
  return <div>{t('category.newKey')}</div>;
}
```

## Pluralization

For text that needs to handle singular and plural forms:

### In Translation Files

```json
{
  "article": {
    "articleCount": "{{count}} article",
    "articleCount_plural": "{{count}} articles"
  }
}
```

### In Component

```javascript
const { t } = useTranslation();

// Automatically selects singular or plural
<p>{t('article.articleCount', { count: articles.length })}</p>
```

## Interpolation

For dynamic values in translations:

### In Translation Files

```json
{
  "messages": {
    "welcome": "Welcome, {{name}}!",
    "itemsDeleted": "{{count}} items deleted successfully"
  }
}
```

### In Component

```javascript
<p>{t('messages.welcome', { name: user.name })}</p>
<p>{t('messages.itemsDeleted', { count: 5 })}</p>
```

## Best Practices

### Naming Conventions

1. **Use camelCase** for keys:
   - ✅ `loadingArticles`
   - ❌ `loading-articles` or `loading_articles`

2. **Be descriptive but concise**:
   - ✅ `article.noArticlesFound`
   - ❌ `article.message1`

3. **Group related translations**:
   - Put all article-related text under `article.*`
   - Put all button labels under `button.*`

### Translation Text

1. **Keep translations natural** - Don't translate literally
2. **Match existing tone** - Maintain consistency with other translations
3. **Context matters** - Add comments in translation files when needed

```json
{
  "media": {
    "deleteUnused": "Delete Unused Images",
    "_comment_deleteUnused": "Shown as button text in media analytics page"
  }
}
```

## Adding a New Language

To add support for a new language (e.g., German):

### Step 1: Create Translation File

Create `src/locales/de/translation.json` with all translations.

### Step 2: Update i18n Configuration

Edit `src/i18n.js`:

```javascript
import translationDE from './locales/de/translation.json';

const resources = {
  en: { translation: translationEN },
  sv: { translation: translationSV },
  de: { translation: translationDE }  // Add new language
};
```

### Step 3: Update LanguageSwitcher

Edit `src/components/LanguageSwitcher.js`:

```javascript
const languages = {
  sv: { name: t('language.swedish'), flag: '🇸🇪' },
  en: { name: t('language.english'), flag: '🇬🇧' },
  de: { name: t('language.german'), flag: '🇩🇪' }
};
```

Add the language option to the dropdown or button group.

## Testing Translations

### Manual Testing

1. Change language using the language switcher
2. Navigate through all pages
3. Verify all text appears in the selected language
4. Check for:
   - Untranslated text (English text when Swedish is selected)
   - Layout issues (text overflow, wrapping)
   - Formatting issues (dates, numbers)

### Checklist

- [ ] All user-facing text is translated
- [ ] Pluralization works correctly
- [ ] Interpolated values display properly
- [ ] No console errors or warnings
- [ ] Language preference persists after refresh
- [ ] All pages work in both languages

## Common Issues

### Text Not Translating

**Problem:** Text appears in English even when Swedish is selected.

**Solution:**
1. Check if the key exists in both translation files
2. Verify the key path is correct: `t('category.key')`
3. Ensure the component imports and uses `useTranslation()`

### Missing Translation Key

**Problem:** Console shows "Missing translation key" warning.

**Solution:**
1. Add the missing key to both language files
2. Verify the key spelling and path

### Pluralization Not Working

**Problem:** Always shows singular or plural form.

**Solution:**
1. Check that you have both `key` and `key_plural` in translation files
2. Ensure you're passing the `count` parameter: `t('key', { count })`

## Translation Coverage

All components should be fully translated:

### Public Pages
- ✅ HomePage
- ✅ ArticlePage  
- ✅ SearchPage
- ✅ 404 Not Found

### Admin Pages
- ✅ AdminPage (Article Dashboard)
- ✅ MediaAnalytics
- ✅ AdminMediaLibrary (partial)
- ✅ UserManagementPage (partial)
- ⚠️ AdminArticleForm (partial)

### Components
- ✅ Navbar
- ✅ AdminNavbar
- ✅ LanguageSwitcher
- ✅ LoadingSpinner
- ✅ ArticleList
- ✅ ArticleCard
- ✅ RelatedArticles
- ✅ CategoryFilter
- ✅ SearchBar
- ✅ MediaCard
- ✅ MediaDetailModal

## Maintenance

### When Adding New Features

1. **Never hardcode user-facing text**
2. **Add translations immediately** when adding new text
3. **Update both language files** at the same time
4. **Test in both languages** before committing

### When Fixing Bugs

If a bug involves text:
1. Check if the issue is translation-related
2. Update translation keys if needed
3. Verify fix works in all languages

## Resources

- [react-i18next Documentation](https://react.i18next.com/)
- [i18next Documentation](https://www.i18next.com/)
- [Translation Keys Reference](../src/locales/en/translation.json)

## Support

For questions or issues with translations:
1. Check this guide first
2. Review existing translation usage in components
3. Consult the react-i18next documentation
4. Ask in project discussions
