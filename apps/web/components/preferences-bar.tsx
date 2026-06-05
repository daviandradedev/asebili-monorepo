"use client";

import { Moon, Sun } from "lucide-react";
import type { ReactNode } from "react";
import type { Language } from "@asebili/i18n";
import { useLanguage } from "../lib/contexts/language-context";
import { useTheme } from "../lib/hooks/use-theme";

type PreferencesBarProps = {
  className?: string;
};

type PreferenceToggleProps = {
  activeOnRight: boolean;
  "aria-label": string;
  onClick: () => void;
  title: string;
  children: ReactNode;
};

const LANGUAGE_LABELS: Record<Language, string> = {
  en: "🇺🇸",
  pt: "🇧🇷",
};

const LANGUAGE_ORDER = ["en", "pt"] as const satisfies readonly Language[];

function classNames(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function nextLanguage(language: Language): Language {
  return language === "pt" ? "en" : "pt";
}

function PreferenceToggle({
  activeOnRight,
  children,
  onClick,
  title,
  ...props
}: PreferenceToggleProps) {
  return (
    <button
      type="button"
      className="preference-toggle"
      onClick={onClick}
      role="switch"
      aria-checked={activeOnRight}
      title={title}
      {...props}
    >
      <span
        className="preference-thumb"
        data-state={activeOnRight ? "right" : "left"}
        aria-hidden="true"
      />
      <span className="preference-labels" aria-hidden="true">
        {children}
      </span>
    </button>
  );
}

export function PreferencesBar({ className }: PreferencesBarProps) {
  const { language, setLanguage, t } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const isPortuguese = language === "pt";
  const isDark = theme === "dark";
  const languageName = isPortuguese
    ? t("preferences.portuguese")
    : t("preferences.english");
  const themeName = isDark ? t("preferences.dark") : t("preferences.light");

  return (
    <div
      className={classNames("preferences-bar", className)}
      role="group"
      aria-label={t("preferences.group")}
    >
      <PreferenceToggle
        activeOnRight={isPortuguese}
        onClick={() => setLanguage(nextLanguage(language))}
        aria-label={`${t("preferences.language")}: ${languageName}`}
        title={`${t("preferences.language")}: ${languageName}`}
      >
        {LANGUAGE_ORDER.map((option) => (
          <span className="preference-mark" key={option}>
            {LANGUAGE_LABELS[option]}
          </span>
        ))}
      </PreferenceToggle>

      <PreferenceToggle
        activeOnRight={isDark}
        onClick={toggleTheme}
        aria-label={`${t("preferences.theme")}: ${themeName}`}
        title={`${t("preferences.theme")}: ${themeName}`}
      >
        <span className="preference-mark">
          <Sun
            size={16}
            strokeWidth={2}
            className={isDark ? "preference-icon-muted" : "preference-icon-sun"}
          />
        </span>
        <span className="preference-mark">
          <Moon
            size={16}
            strokeWidth={2}
            className={
              isDark ? "preference-icon-moon" : "preference-icon-muted"
            }
          />
        </span>
      </PreferenceToggle>
    </div>
  );
}
