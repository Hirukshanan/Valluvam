import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import translations from '../translations';

export const SUPPORTED_LANGUAGES = ['en', 'ta'];
export const DEFAULT_LANGUAGE = 'en';
const STORAGE_KEY = 'valluvam_language';

const LanguageContext = createContext({
  language: DEFAULT_LANGUAGE,
  setLanguage: () => {},
  t: (key, params) => key,
});

export function LanguageProvider({ children }) {
  const [language, setLanguageState] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved && SUPPORTED_LANGUAGES.includes(saved)) {
        return saved;
      }
    } catch {
      // LocalStorage access may fail in restricted/private modes
    }
    return DEFAULT_LANGUAGE;
  });

  const setLanguage = useCallback((newLang) => {
    if (SUPPORTED_LANGUAGES.includes(newLang)) {
      setLanguageState(newLang);
      try {
        localStorage.setItem(STORAGE_KEY, newLang);
      } catch {
        // Ignore storage write errors
      }
    }
  }, []);

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  /**
   * Translates a dot-notated key with optional interpolation params.
   * e.g. t('about.title', { org: 'Valluvam' })
   * Fallback: active language -> English fallback -> key itself.
   */
  const t = useCallback(
    (key, params) => {
      if (!key) return '';

      const getNested = (obj, path) =>
        path.split('.').reduce((acc, part) => (acc && acc[part] !== undefined ? acc[part] : undefined), obj);

      let val = getNested(translations[language], key);

      // Fallback to English if active language lacks the key
      if (val === undefined && language !== 'en') {
        val = getNested(translations.en, key);
      }

      if (val === undefined) {
        return key;
      }

      // If string and params provided, interpolate "{paramKey}" tokens
      if (typeof val === 'string' && params && typeof params === 'object') {
        return Object.entries(params).reduce((str, [pKey, pVal]) => {
          return str.replaceAll(`{${pKey}}`, pVal !== undefined && pVal !== null ? String(pVal) : '');
        }, val);
      }

      return val;
    },
    [language]
  );

  const value = useMemo(
    () => ({
      language,
      setLanguage,
      t,
    }),
    [language, setLanguage, t]
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  return (
    context || {
      language: DEFAULT_LANGUAGE,
      setLanguage: () => {},
      t: (key) => key,
    }
  );
}
