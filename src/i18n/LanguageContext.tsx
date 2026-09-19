'use client';

import { createContext, useContext, useEffect, useSyncExternalStore } from 'react';
import { translations, LanguageCode } from './translations';

type ArrayPath = 'pricing.features' | 'process.steps';
interface Translate {
  (path: ArrayPath): string[];
  (path: string): string;
}
interface LanguageContextType {
  lang: LanguageCode;
  setLang: (language: LanguageCode) => void;
  t: Translate;
}
const LanguageContext = createContext<LanguageContextType | undefined>(undefined);
let preference: LanguageCode | undefined;
const isLanguage = (value: string | null): value is LanguageCode => !!value && Object.hasOwn(translations, value);

function getLanguage(): LanguageCode {
  if (preference) return preference;
  try {
    const saved = localStorage.getItem('llc-lang');
    if (isLanguage(saved)) return saved;
  } catch { /* Storage can be disabled in private browsing. */ }
  const language = navigator.language.split('-')[0];
  return isLanguage(language) ? language : 'en';
}
function subscribe(callback: () => void) {
  const storage = () => { preference = undefined; callback(); };
  window.addEventListener('llc-language', callback);
  window.addEventListener('storage', storage);
  return () => {
    window.removeEventListener('llc-language', callback);
    window.removeEventListener('storage', storage);
  };
}
function setLanguage(language: LanguageCode) {
  preference = language;
  try { localStorage.setItem('llc-lang', language); } catch { /* Keep the session preference. */ }
  window.dispatchEvent(new Event('llc-language'));
}
function serverLanguage(): LanguageCode { return 'en'; }

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const lang = useSyncExternalStore(subscribe, getLanguage, serverLanguage);
  useEffect(() => { document.documentElement.lang = lang; }, [lang]);

  function t(path: ArrayPath): string[];
  function t(path: string): string;
  function t(path: string): string | string[] {
    let current: unknown = translations[lang];
    for (const key of path.split('.')) {
      if (!current || typeof current !== 'object') return path;
      current = (current as Record<string, unknown>)[key];
    }
    if (typeof current === 'string') return current;
    if (Array.isArray(current) && current.every(value => typeof value === 'string')) return current;
    return path;
  }
  return <LanguageContext.Provider value={{ lang, setLang: setLanguage, t }}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used within a LanguageProvider');
  return context;
}
