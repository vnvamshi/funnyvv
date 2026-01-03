import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import en from './locales/en.json';
import hi from './locales/hi.json';

const i18nV3 = i18next.createInstance();

i18nV3
	.use(LanguageDetector)
	.use(initReactI18next)
	.init({
		resources: {
			en: { translation: en },
			hi: { translation: hi },
		},
		fallbackLng: 'en',
		debug: false,
		interpolation: { escapeValue: false },
		detection: {
			order: ['localStorage', 'navigator', 'htmlTag'],
			caches: ['localStorage'],
		},
	});

export default i18nV3; 