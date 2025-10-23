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
  try {
    if (lang === 'vi') {
      const module = await import('../translations/vi.json');
      return module.default;
    }
    // Default to English
    const module = await import('../translations/en.json');
    return module.default;
  } catch (error) {
    console.error(`Failed to load translations for '${lang}', falling back to 'en'.`, error);
    try {
        const module = await import('../translations/en.json');
        return module.default;
    } catch (fallbackError) {
        console.error(`Failed to load fallback English translations.`, fallbackError);
        return {};
    }
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