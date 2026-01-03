import React from 'react';
import { Globe } from 'lucide-react';
import { useTranslations } from '../hooks/useTranslations';

const LanguageSwitcher: React.FC = () => {
  const { currentLanguage, changeLanguage } = useTranslations();

  const toggleLanguage = () => {
    const newLang = currentLanguage === 'en' ? 'es' : 'en';
    changeLanguage(newLang);
  };

  const currentLang = currentLanguage === 'en' ? 'EN' : 'ES';
  const nextLang = currentLanguage === 'en' ? 'ES' : 'EN';

  return (
    <button
      onClick={toggleLanguage}
      className="flex items-center space-x-2 px-3 py-2 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors duration-200"
      title={`Switch to ${nextLang}`}
    >
      <Globe size={16} />
      <span className="text-sm font-medium">{currentLang}</span>
    </button>
  );
};

export default LanguageSwitcher; 