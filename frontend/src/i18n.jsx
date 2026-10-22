import { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react';
import en from './locales/en.json';
import fr from './locales/fr.json';
import rw from './locales/rw.json';

export const LANGUAGES = [
  { code: 'rw', label: 'Kinyarwanda' },
  { code: 'en', label: 'English' },
  { code: 'fr', label: 'Français' },
];

const DICTS = { en, fr, rw };
const KEY = 'easylearn_lang';
const I18nContext = createContext(null);

function initialLang() {
  try {
    const saved = localStorage.getItem(KEY);
    if (saved && DICTS[saved]) return saved;
  } catch { /* ignore */ }
  const nav = (navigator.language || 'rw').slice(0, 2);
  return DICTS[nav] ? nav : 'rw';
}

export function I18nProvider({ children }) {
  const [lang, setLangState] = useState(initialLang);

  const setLang = useCallback((code) => {
    if (!DICTS[code]) return;
    setLangState(code);
    try { localStorage.setItem(KEY, code); } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const value = useMemo(() => {
    const dict = DICTS[lang];
    // t('progress', { n: 2, total: 5 }) and t('errors.bad_credentials') both work.
    const t = (key, vars = {}) => {
      const raw = key.split('.').reduce((o, k) => (o ? o[k] : undefined), dict) ?? key;
      return String(raw).replace(/\{(\w+)\}/g, (_, k) => (vars[k] ?? `{${k}}`));
    };
    return { lang, setLang, t };
  }, [lang, setLang]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export const useI18n = () => useContext(I18nContext);
