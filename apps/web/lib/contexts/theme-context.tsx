"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { browserTheme, persistTheme, storedTheme, type Theme } from "../preferences";

type ThemeContextType = {
  theme: Theme;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

function paintTheme(theme: Theme) {
  document.documentElement.classList.remove("light", "dark");
  document.documentElement.classList.add(theme);
  document.documentElement.style.colorScheme = theme;
}

export function ThemeProvider({
  initialTheme,
  children,
}: {
  initialTheme: Theme | null;
  children: ReactNode;
}) {
  const [theme, setTheme] = useState<Theme>(initialTheme ?? "dark");
  const [locked, setLocked] = useState(initialTheme != null);

  useEffect(() => {
    paintTheme(theme);
  }, [theme]);

  useEffect(() => {
    if (locked) return;
    const stored = storedTheme();
    if (stored) {
      setLocked(true);
      setTheme(stored);
      persistTheme(stored);
      return;
    }
    const apply = () => setTheme(browserTheme());
    apply();
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    media.addEventListener("change", apply);
    return () => media.removeEventListener("change", apply);
  }, [locked]);

  const toggleTheme = useCallback(() => {
    setLocked(true);
    setTheme((current) => {
      const next = current === "light" ? "dark" : "light";
      persistTheme(next);
      return next;
    });
  }, []);

  const value = useMemo(() => ({ theme, toggleTheme }), [theme, toggleTheme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useThemeContext() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useThemeContext must be used within ThemeProvider");
  }
  return context;
}
