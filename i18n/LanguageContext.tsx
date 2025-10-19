import React, { createContext, useState, useEffect, useCallback } from 'react';
import { getFromStorage, saveToStorage } from '../utils/storage';

type Language = 'en' | 'vi';

interface LanguageContextType {
  language: Language;
  changeLanguage: (lang: Language) => void;
  t: (key: string, options?: { [key: string]: string | number }) => string;
}

export const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const fetchTranslations = async (lang: Language): Promise<any> => {
  const fetchLangFile = async (l: Language) => {
    const response = await fetch(`/translations/${l}.json`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  };

  try {
    return await fetchLangFile(lang);
  } catch (error) {
    console.error(`Failed to fetch translations for '${lang}':`, error);
    // If the requested language fails, fall back to English
    if (lang !== 'en') {
      console.warn(`Falling back to English translations.`);
      try {
        return await fetchLangFile('en');
      } catch (fallbackError) {
        console.error(`Failed to fetch fallback English translations:`, fallbackError);
      }
    }
    // Return empty object if all attempts fail to prevent app crash
    return {};
  }
};


export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>(() => {
    return getFromStorage<Language>('language', 'en');
  });
  const [translations, setTranslations] = useState<any>({});

  useEffect(() => {
    let isMounted = true;
    fetchTranslations(language).then(data => {
        if(isMounted) {
            setTranslations(data);
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
