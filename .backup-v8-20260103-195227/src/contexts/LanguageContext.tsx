import React, { createContext, useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

interface LanguageContextType {
  currentLanguage: 'en' | 'es';
  changeLanguage: (language: 'en' | 'es') => void;
  isLanguageReady: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const useLanguageContext = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguageContext must be used within a LanguageProvider');
  }
  return context;
};

interface LanguageProviderProps {
  children: React.ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const { i18n } = useTranslation();
  const [isLanguageReady, setIsLanguageReady] = useState(false);

  useEffect(() => {
    const handleLanguageChanged = () => {
      setIsLanguageReady(true);
    };

    if (i18n.isInitialized) {
      setIsLanguageReady(true);
    }

    i18n.on('languageChanged', handleLanguageChanged);

    return () => {
      i18n.off('languageChanged', handleLanguageChanged);
    };
  }, [i18n]);

  const changeLanguage = (language: 'en' | 'es') => {
    i18n.changeLanguage(language);
  };

  const value: LanguageContextType = {
    currentLanguage: (i18n.language as 'en' | 'es') || 'en',
    changeLanguage,
    isLanguageReady,
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}; 