"use client";

import type { ReactNode } from "react";
import { AccordionStableScroll } from "./accordion-stable-scroll";
import { AccessibilityProvider } from "../lib/contexts/accessibility-context";
import { LanguageProvider } from "../lib/contexts/language-context";
import { ThemeProvider } from "../lib/contexts/theme-context";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <AccessibilityProvider>
        <LanguageProvider>
          <AccordionStableScroll>{children}</AccordionStableScroll>
        </LanguageProvider>
      </AccessibilityProvider>
    </ThemeProvider>
  );
}
