import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  DEFAULT_LANGUAGE,
  formatMessage,
  getHtmlLang,
  translate,
  type Language,
} from "@asebili/i18n";
import { getThemeColors, type ThemeColors, type ThemeMode } from "../theme";

const LANGUAGE_KEY = "asebili_language";
const THEME_KEY = "asebili_theme";

type PreferencesContextType = {
  language: Language;
  setLanguage: (lang: Language) => void;
  theme: ThemeMode;
  toggleTheme: () => void;
  colors: ThemeColors;
  t: (path: string) => string;
  format: (path: string, values: Record<string, string | number>) => string;
};

const PreferencesContext = createContext<PreferencesContextType | undefined>(
  undefined,
);

export function PreferencesProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(DEFAULT_LANGUAGE);
  const [theme, setTheme] = useState<ThemeMode>("light");
  useEffect(() => {
    async function loadPreferences() {
      const [savedLanguage, savedTheme] = await Promise.all([
        AsyncStorage.getItem(LANGUAGE_KEY),
        AsyncStorage.getItem(THEME_KEY),
      ]);

      if (savedLanguage === "pt" || savedLanguage === "en") {
        setLanguageState(savedLanguage);
      }
      if (savedTheme === "light" || savedTheme === "dark") {
        setTheme(savedTheme);
      }
    }

    void loadPreferences();
  }, []);

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    void AsyncStorage.setItem(LANGUAGE_KEY, lang);
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme((current) => {
      const next = current === "light" ? "dark" : "light";
      void AsyncStorage.setItem(THEME_KEY, next);
      return next;
    });
  }, []);

  const t = useCallback(
    (path: string) => translate(language, path),
    [language],
  );

  const format = useCallback(
    (path: string, values: Record<string, string | number>) =>
      formatMessage(t(path), values),
    [t],
  );

  const colors = useMemo(() => getThemeColors(theme), [theme]);

  const value = useMemo(
    () => ({
      language,
      setLanguage,
      theme,
      toggleTheme,
      colors,
      t,
      format,
    }),
    [colors, format, language, setLanguage, t, theme, toggleTheme],
  );

  return (
    <PreferencesContext.Provider value={value}>
      {children}
    </PreferencesContext.Provider>
  );
}

export function usePreferences() {
  const context = useContext(PreferencesContext);
  if (!context) {
    throw new Error("usePreferences must be used within PreferencesProvider");
  }
  return context;
}

export function useLocaleTag() {
  const { language } = usePreferences();
  return getHtmlLang(language);
}
