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

const CONTRAST_KEY = "asebili_high_contrast";
const FONT_SCALE_KEY = "asebili_font_scale";
const MIN_FONT_SCALE = -1;
const MAX_FONT_SCALE = 2;

type FontScale = -1 | 0 | 1 | 2;

type AccessibilityContextType = {
  fontScale: FontScale;
  highContrast: boolean;
  canDecreaseFont: boolean;
  canIncreaseFont: boolean;
  decreaseFont: () => void;
  increaseFont: () => void;
  resetFont: () => void;
  toggleContrast: () => void;
};

const AccessibilityContext = createContext<
  AccessibilityContextType | undefined
>(undefined);

function clampFontScale(value: number): FontScale {
  return Math.min(MAX_FONT_SCALE, Math.max(MIN_FONT_SCALE, value)) as FontScale;
}

function parseFontScale(value: string | null): FontScale {
  if (!value) return 0;
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? clampFontScale(parsed) : 0;
}

function applyFontScale(scale: FontScale) {
  const root = document.documentElement;
  root.classList.toggle("a11y-font-small", scale === -1);
  root.classList.toggle("a11y-font-large", scale === 1);
  root.classList.toggle("a11y-font-xlarge", scale === 2);
}

export function AccessibilityProvider({ children }: { children: ReactNode }) {
  const [fontScale, setFontScale] = useState<FontScale>(0);
  const [highContrast, setHighContrast] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setFontScale(parseFontScale(localStorage.getItem(FONT_SCALE_KEY)));
    setHighContrast(localStorage.getItem(CONTRAST_KEY) === "true");
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    applyFontScale(fontScale);
    localStorage.setItem(FONT_SCALE_KEY, String(fontScale));
  }, [fontScale, loaded]);

  useEffect(() => {
    if (!loaded) return;
    document.documentElement.classList.toggle("a11y-contrast", highContrast);
    localStorage.setItem(CONTRAST_KEY, String(highContrast));
  }, [highContrast, loaded]);

  const decreaseFont = useCallback(() => {
    setFontScale((current) => clampFontScale(current - 1));
  }, []);

  const increaseFont = useCallback(() => {
    setFontScale((current) => clampFontScale(current + 1));
  }, []);

  const resetFont = useCallback(() => {
    setFontScale(0);
  }, []);

  const toggleContrast = useCallback(() => {
    setHighContrast((current) => !current);
  }, []);

  const value = useMemo(
    () => ({
      fontScale,
      highContrast,
      canDecreaseFont: fontScale > MIN_FONT_SCALE,
      canIncreaseFont: fontScale < MAX_FONT_SCALE,
      decreaseFont,
      increaseFont,
      resetFont,
      toggleContrast,
    }),
    [
      decreaseFont,
      fontScale,
      highContrast,
      increaseFont,
      resetFont,
      toggleContrast,
    ],
  );

  return (
    <AccessibilityContext.Provider value={value}>
      {children}
    </AccessibilityContext.Provider>
  );
}

export function useAccessibility() {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error(
      "useAccessibility must be used within AccessibilityProvider",
    );
  }
  return context;
}
