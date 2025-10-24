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
      return import('./vi.json');
    case 'en':
    default:
      return import('./en.json');
  }
};


export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>(() => {
    return getFromStorage<Language>('language', 'en');
  });
  const [translations, setTranslations] = useState<any>({});

  useEffect(() => {
    let isMounted = true;
    const fetchTranslations = async () => {
        try {
            const module = await loadTranslations(language);
            if (isMounted) {
                setTranslations(module.default);
            }
        } catch (error) {
            console.error(`Failed to load translations for '${language}', falling back to 'en'.`, error);
            if (isMounted && language !== 'en') {
                try {
                    const fallbackModule = await loadTranslations('en');
                    setTranslations(fallbackModule.default);
                } catch (fallbackError) {
                    console.error("Failed to load fallback English translations.", fallbackError);
                }
            }
        }
    };
    
    fetchTranslations();
      
    return () => { isMounted = false; }
  }, [language]);

  const changeLanguage = (lang: Language) => {
    setLanguage(lang);
    saveToStorage('language', lang);
  };

  const t = useCallback((key: string, options?: { [key: string]: string | number }): string => {
    if (Object.keys(translations).length === 0) {
      return key; // Return key if translations are not loaded yet
    }
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
