import 'react-i18next';
import enTranslations from '../locales/en.json';

declare module 'react-i18next' {
  interface CustomTypeOptions {
    defaultNS: 'translation';
    resources: {
      translation: typeof enTranslations;
    };
  }
}

export type TranslationKeys = keyof typeof enTranslations; 