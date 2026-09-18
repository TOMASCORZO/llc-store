'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { translations, LanguageCode } from './translations';

interface LanguageContextType {
  lang: LanguageCode;
  setLang: (l: LanguageCode) => void;
  t: (path: string) => any;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLang] = useState<LanguageCode>('en');

  // Load preferred language from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('llc-lang') as LanguageCode;
    if (saved && translations[saved]) {
      setLang(saved);
    } else {
      // Very basic user language detection
      const navLang = navigator.language.split('-')[0] as LanguageCode;
      if (translations[navLang]) {
        setLang(navLang);
      }
    }
  }, []);

  const changeLang = (l: LanguageCode) => {
    setLang(l);
    localStorage.setItem('llc-lang', l);
  };

  const t = (path: string) => {
    const keys = path.split('.');
    let current: any = translations[lang];
    for (const key of keys) {
      if (current === undefined) break;
      current = current[key];
    }
    return current || path;
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang: changeLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
