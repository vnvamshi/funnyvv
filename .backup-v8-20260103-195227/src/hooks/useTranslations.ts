import { useTranslation } from 'react-i18next';
import { TranslationKeys } from '../types/i18n';

export const useTranslations = () => {
  const { t, i18n } = useTranslation();

  const translate = (key: TranslationKeys, options?: any): string => {
    return t(key, options) as string;
  };

  const changeLanguage = (language: 'en' | 'es') => {
    i18n.changeLanguage(language);
  };

  const currentLanguage = i18n.language as 'en' | 'es';

  return {
    t: translate,
    changeLanguage,
    currentLanguage,
    isReady: i18n.isInitialized,
  };
}; 