"use client";

import type { ReactNode } from "react";
import { AccordionStableScroll } from "./accordion-stable-scroll";
import { AccessibilityProvider } from "../lib/contexts/accessibility-context";
import { LanguageProvider } from "../lib/contexts/language-context";
import { ThemeProvider } from "../lib/contexts/theme-context";

export function Providers({
  initialTheme,
  initialLanguage,
  children,
}: {
  initialTheme: "light" | "dark" | null;
  initialLanguage: "pt" | "en" | null;
  children: ReactNode;
}) {
  return (
    <ThemeProvider initialTheme={initialTheme}>
      <AccessibilityProvider>
        <LanguageProvider initialLanguage={initialLanguage}>
          <AccordionStableScroll>{children}</AccordionStableScroll>
        </LanguageProvider>
      </AccessibilityProvider>
    </ThemeProvider>
  );
}
