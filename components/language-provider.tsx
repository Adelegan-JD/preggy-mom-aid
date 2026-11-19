"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { AppLanguage, normalizeLanguage, translate, TranslationKey } from "@/lib/i18n/translations";

type LanguageContextValue = {
  language: AppLanguage;
  setLanguage: (language: AppLanguage) => void;
  t: (key: TranslationKey) => string;
};
const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children, initialLanguage = "en" }: { children: React.ReactNode; initialLanguage?: AppLanguage }) {
  const [language, setLanguageState] = useState<AppLanguage>(initialLanguage);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem("pma-language-v1");
      if (saved) setLanguageState(normalizeLanguage(saved));
    } catch { /* Storage may be unavailable; keep the server-provided language. */ }
  }, []);

  const setLanguage = useCallback((next: AppLanguage) => {
    setLanguageState(next);
    try {
      window.localStorage.setItem("pma-language-v1", next);
      document.cookie = `pma-language=${next}; Path=/; Max-Age=31536000; SameSite=Lax`;
      document.documentElement.lang = next === "pcm" ? "en-NG" : next === "yo" ? "yo-NG" : next === "ha" ? "ha-NG" : next === "ig" ? "ig-NG" : "en-NG";
    } catch { /* Language still changes for this session. */ }
  }, []);

  const t = useCallback((key: TranslationKey) => translate(language, key), [language]);
  const value = useMemo(() => ({ language, setLanguage, t }), [language, setLanguage, t]);
  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const value = useContext(LanguageContext);
  if (!value) throw new Error("useLanguage must be used inside LanguageProvider");
  return value;
}
