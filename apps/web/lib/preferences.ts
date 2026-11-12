export type Theme = "light" | "dark";
export type Language = "pt" | "en";

const ONE_YEAR = 60 * 60 * 24 * 365;

export function readThemeCookie(value: string | undefined): Theme | null {
  return value === "light" || value === "dark" ? value : null;
}

export function readLanguageCookie(value: string | undefined): Language | null {
  return value === "pt" || value === "en" ? value : null;
}

function cookieDomain() {
  if (typeof window === "undefined" || !window.location.hostname.includes("daviandrade.dev")) return "";
  return "domain=.daviandrade.dev;";
}

export function persistTheme(theme: Theme) {
  document.cookie = `theme=${theme};path=/;max-age=${ONE_YEAR};SameSite=Lax;${cookieDomain()}`;
  localStorage.setItem("theme", theme);
}

export function persistLanguage(language: Language) {
  document.cookie = `language=${language};path=/;max-age=${ONE_YEAR};SameSite=Lax;${cookieDomain()}`;
  localStorage.setItem("language", language);
}

export function browserTheme(): Theme {
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function browserLanguage(): Language {
  const tags = navigator.languages?.length ? navigator.languages : [navigator.language];
  return tags.some((tag) => tag.toLowerCase().startsWith("pt")) ? "pt" : "en";
}

export function storedTheme(): Theme | null {
  const value = localStorage.getItem("theme");
  return value === "light" || value === "dark" ? value : null;
}

export function storedLanguage(): Language | null {
  const shared = localStorage.getItem("language");
  if (shared === "pt" || shared === "en") return shared;
  const legacy = localStorage.getItem("asebili_language");
  return legacy === "pt" || legacy === "en" ? legacy : null;
}
