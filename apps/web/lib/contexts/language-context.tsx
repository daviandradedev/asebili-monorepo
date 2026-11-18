"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { getHtmlLang, translate, type Language } from "@asebili/i18n";
import { browserLanguage, persistLanguage, storedLanguage } from "../preferences";

type LanguageContextType = {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (path: string) => string;
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({
  initialLanguage,
  children,
}: {
  initialLanguage: Language | null;
  children: ReactNode;
}) {
  const router = useRouter();
  const synced = useRef(false);
  const [language, setLanguageState] = useState<Language>(initialLanguage ?? "pt");
  const [locked, setLocked] = useState(initialLanguage != null);

  useEffect(() => {
    document.documentElement.lang = getHtmlLang(language);
  }, [language]);

  useEffect(() => {
    if (locked || synced.current) return;
    synced.current = true;
    const stored = storedLanguage();
    const next = stored ?? browserLanguage();
    const baseline = initialLanguage ?? "pt";
    if (!stored && next === baseline) return;
    persistLanguage(next);
    setLanguageState(next);
    setLocked(true);
    if (next !== baseline) router.refresh();
  }, [initialLanguage, locked, router]);

  const setLanguage = useCallback(
    (lang: Language) => {
      setLocked(true);
      setLanguageState(lang);
      persistLanguage(lang);
      router.refresh();
    },
    [router],
  );

  const t = useCallback((path: string) => translate(language, path), [language]);

  const value = useMemo(
    () => ({ language, setLanguage, t }),
    [language, setLanguage, t],
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within LanguageProvider");
  }
  return context;
}
