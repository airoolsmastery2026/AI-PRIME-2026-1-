import React, { createContext, useState, useEffect, useCallback } from 'react';
import { getFromStorage, saveToStorage } from '../utils/storage';

type Language = 'en' | 'vi';

interface LanguageContextType {
  language: Language;
  changeLanguage: (lang: Language) => void;
  t: (key: string, options?: { [key: string]: string | number }) => string;
}

export const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const loadTranslations = (lang: Language): Promise<any> => {
  switch (lang) {
    case 'vi':
      return import('../translations/vi.json');
    case 'en':
    default:
      return import('../translations/en.json');
  }
};


export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>(() => {
    return getFromStorage<Language>('language', 'en');
  });
  const [translations, setTranslations] = useState<any>({});

  useEffect(() => {
    let isMounted = true;
    loadTranslations(language)
      .then(module => {
        if (isMounted) {
          setTranslations(module.default);
        }
      })
      .catch(error => {
        console.error(`Failed to load translations for '${language}', falling back to 'en'.`, error);
        if (isMounted && language !== 'en') {
          // Attempt to load English as a fallback
          loadTranslations('en').then(module => setTranslations(module.default));
        }
      });
      
    return () => { isMounted = false; }
  }, [language]);

  const changeLanguage = (lang: Language) => {
    setLanguage(lang);
    saveToStorage('language', lang);
  };

  const t = useCallback((key: string, options?: { [key: string]: string | number }): string => {
    const keys = key.split('.');
    let result = translations;
    for (const k of keys) {
      result = result?.[k];
      if (result === undefined) {
        return key; // Return the key itself if not found
      }
    }

    if (typeof result === 'string' && options) {
        return Object.entries(options).reduce((acc, [optKey, optValue]) => {
            return acc.replace(`{{${optKey}}}`, String(optValue));
        }, result);
    }
    
    return result || key;
  }, [translations]);

  const value = { language, changeLanguage, t };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};