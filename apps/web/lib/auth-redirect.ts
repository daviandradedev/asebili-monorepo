import type { Language } from "./preferences";

export function redirectLanguage(cookie: string, stored: string | null): Language {
  const fromCookie = /(?:^|; )language=(pt|en)/.exec(cookie)?.[1];
  if (fromCookie === "pt" || fromCookie === "en") return fromCookie;
  if (stored === "pt" || stored === "en") return stored;
  return "pt";
}
