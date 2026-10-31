import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { Language, SUPPORTED_LANGUAGES, TranslationDictionary } from './types';
import { enTranslations } from './translations/en';
import { knTranslations } from './translations/kn';
import { hiTranslations } from './translations/hi';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (path: string, fallback?: string) => string;
  getCropName: (cropId: string, defaultName?: string) => string;
  dictionary: TranslationDictionary;
}

const STORAGE_KEY = 'harvestroute_language';

const DICTIONARIES: Record<Language, TranslationDictionary> = {
  en: enTranslations,
  kn: knTranslations,
  hi: hiTranslations,
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        const saved = localStorage.getItem(STORAGE_KEY) as Language;
        if (saved && (saved === 'en' || saved === 'kn' || saved === 'hi')) {
          return saved;
        }
      } catch {
        // Ignore local storage error
      }
    }
    return 'en';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        localStorage.setItem(STORAGE_KEY, lang);
      } catch {
        // Ignore storage write error
      }
    }
    if (typeof document !== 'undefined') {
      document.documentElement.lang = lang;
    }
  };

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.lang = language;
    }
  }, [language]);

  const dictionary = useMemo(() => DICTIONARIES[language] || enTranslations, [language]);

  /**
   * Helper to retrieve nested translations using dot notation (e.g. 'nav.dashboard', 'step1.title')
   */
  const t = (path: string, fallback?: string): string => {
    const keys = path.split('.');
    let current: any = dictionary;

    for (const key of keys) {
      if (current && typeof current === 'object' && key in current) {
        current = current[key];
      } else {
        // Fallback to English dictionary
        let enCurrent: any = enTranslations;
        for (const enKey of keys) {
          if (enCurrent && typeof enCurrent === 'object' && enKey in enCurrent) {
            enCurrent = enCurrent[enKey];
          } else {
            return fallback || path;
          }
        }
        return typeof enCurrent === 'string' ? enCurrent : fallback || path;
      }
    }

    return typeof current === 'string' ? current : fallback || path;
  };

  /**
   * Returns crop name translated into active language (e.g. 'tomato' -> 'ಟೊಮೆಟೊ' or 'टमाटर')
   */
  const getCropName = (cropId: string, defaultName?: string): string => {
    const cleanId = cropId.toLowerCase().trim();
    if (dictionary.crops && dictionary.crops[cleanId]) {
      return dictionary.crops[cleanId];
    }
    if (enTranslations.crops && enTranslations.crops[cleanId]) {
      return enTranslations.crops[cleanId];
    }
    return defaultName || cropId;
  };

  const value = {
    language,
    setLanguage,
    t,
    getCropName,
    dictionary,
  };

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
};

export function useLanguage(): LanguageContextType {
  const context = useContext(LanguageContext);
  if (!context) {
    // Provide safe fallback if component is rendered outside provider
    return {
      language: 'en',
      setLanguage: () => {},
      t: (path: string, fallback?: string) => fallback || path,
      getCropName: (_id: string, defaultName?: string) => defaultName || _id,
      dictionary: enTranslations,
    };
  }
  return context;
}

export { SUPPORTED_LANGUAGES };

