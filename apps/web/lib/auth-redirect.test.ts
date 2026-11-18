import { translate } from "@asebili/i18n";
import { describe, expect, it } from "vitest";
import { redirectLanguage } from "./auth-redirect";

describe("auth redirect overlay copy", () => {
  it("reads the language cookie before storage", () => {
    expect(redirectLanguage("language=en", "pt")).toBe("en");
    expect(redirectLanguage("theme=dark; language=pt", null)).toBe("pt");
  });

  it("uses stored language when the cookie is missing", () => {
    expect(redirectLanguage("", "en")).toBe("en");
    expect(redirectLanguage("language=es", "en")).toBe("en");
  });

  it("falls back to portuguese", () => {
    expect(redirectLanguage("", null)).toBe("pt");
    expect(translate("pt", "redirect.openingAccount")).toBe("Abrindo sua conta");
    expect(translate("en", "redirect.openingAccount")).toBe("Opening your account");
  });
});
