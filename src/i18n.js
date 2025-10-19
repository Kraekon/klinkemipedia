import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import translationEN from './locales/en/translation.json';
import translationSV from './locales/sv/translation.json';

// Translation resources
const resources = {
  en: {
    translation: translationEN
  },
  sv: {
    translation: translationSV
  }
};

i18n
  .use(LanguageDetector) // Detect user language
  .use(initReactI18next) // Pass i18n to react-i18next
  .init({
    resources,
    fallbackLng: 'sv', // Default to Swedish
    lng: 'sv', // Default language
    debug: false,
    
    interpolation: {
      escapeValue: false // React already escapes
    },
    
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage']
    }
  });

export default i18n;
