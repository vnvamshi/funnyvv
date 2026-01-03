# Internationalization (i18n) Implementation Guide

## Overview

This project uses **react-i18next** with **i18next** for internationalization support. The implementation provides type-safe translations with TypeScript and supports English and Spanish languages.

## Architecture

### Core Files

- `src/i18n.ts` - Main i18n configuration
- `src/locales/en.json` - English translations
- `src/locales/es.json` - Spanish translations
- `src/types/i18n.d.ts` - TypeScript type definitions
- `src/hooks/useTranslations.ts` - Custom hook for type-safe translations
- `src/contexts/LanguageContext.tsx` - Language state management
- `src/utils/translationKeys.ts` - Translation key constants
- `src/components/LanguageSwitcher.tsx` - Language toggle component

## Usage

### Basic Translation

```tsx
import { useTranslation } from 'react-i18next';

const MyComponent = () => {
  const { t } = useTranslation();
  
  return <h1>{t('home.hero.title')}</h1>;
};
```

### Using Custom Hook (Recommended)

```tsx
import { useTranslations } from '../hooks/useTranslations';

const MyComponent = () => {
  const { t } = useTranslations();
  
  return <h1>{t('home.hero.title')}</h1>;
};
```

### Using Translation Keys Constants

```tsx
import { useTranslations } from '../hooks/useTranslations';
import { TRANSLATION_KEYS } from '../utils/translationKeys';

const MyComponent = () => {
  const { t } = useTranslations();
  
  return <h1>{t(TRANSLATION_KEYS.home.hero.title)}</h1>;
};
```

### Language Switching

```tsx
import { useLanguageContext } from '../contexts/LanguageContext';

const MyComponent = () => {
  const { currentLanguage, changeLanguage } = useLanguageContext();
  
  return (
    <button onClick={() => changeLanguage('es')}>
      Switch to Spanish
    </button>
  );
};
```

## Translation File Structure

Translation files are organized in a nested structure:

```json
{
  "navigation": {
    "buy": "Buy",
    "sell": "Sell"
  },
  "home": {
    "hero": {
      "title": "Find Your Dream Home",
      "subtitle": "Discover the perfect property..."
    }
  }
}
```

## Adding New Translations

1. **Add to English file** (`src/locales/en.json`):
```json
{
  "newSection": {
    "newKey": "English text"
  }
}
```

2. **Add to Spanish file** (`src/locales/es.json`):
```json
{
  "newSection": {
    "newKey": "Spanish text"
  }
}
```

3. **Add to translation keys** (`src/utils/translationKeys.ts`):
```typescript
export const TRANSLATION_KEYS = {
  // ... existing keys
  newSection: {
    newKey: 'newSection.newKey',
  },
} as const;
```

4. **Use in component**:
```tsx
const { t } = useTranslations();
return <div>{t(TRANSLATION_KEYS.newSection.newKey)}</div>;
```

## Features

### Type Safety
- All translation keys are type-checked
- Autocomplete support in IDEs
- Compile-time error detection for missing keys

### Language Detection
- Automatically detects browser language
- Falls back to English if language not supported
- Persists language choice in localStorage

### Performance
- Lazy loading of translation files
- Efficient re-rendering on language changes
- Minimal bundle size impact

## Best Practices

1. **Use translation key constants** to avoid typos
2. **Organize translations logically** by feature/section
3. **Keep translations concise** and clear
4. **Use interpolation** for dynamic content
5. **Test both languages** during development

## Interpolation Example

```tsx
// Translation file
{
  "welcome": "Welcome, {{name}}!"
}

// Component
const { t } = useTranslations();
return <div>{t('welcome', { name: 'John' })}</div>;
```

## Pluralization Example

```tsx
// Translation file
{
  "items": "{{count}} item",
  "items_plural": "{{count}} items"
}

// Component
const { t } = useTranslations();
return <div>{t('items', { count: 5 })}</div>; // "5 items"
```

## Troubleshooting

### Common Issues

1. **Translation not showing**: Check if the key exists in both language files
2. **Type errors**: Ensure the key is added to `translationKeys.ts`
3. **Language not switching**: Verify the LanguageProvider is wrapping your app

### Debug Mode

Enable debug mode in development:
```typescript
// src/i18n.ts
debug: process.env.NODE_ENV === 'development'
```

This will log missing translations to the console.

## Future Enhancements

- Add more languages (French, German, etc.)
- Implement RTL support for Arabic/Hebrew
- Add translation management system
- Implement lazy loading for large translation files 