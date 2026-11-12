import { describe, expect, it } from "vitest";
import { readLanguageCookie, readThemeCookie } from "./preferences";

describe("preference cookies", () => {
  it("accepts only light and dark", () => {
    expect(readThemeCookie("dark")).toBe("dark");
    expect(readThemeCookie("light")).toBe("light");
    expect(readThemeCookie("blue")).toBeNull();
    expect(readThemeCookie(undefined)).toBeNull();
  });

  it("accepts only pt and en", () => {
    expect(readLanguageCookie("pt")).toBe("pt");
    expect(readLanguageCookie("en")).toBe("en");
    expect(readLanguageCookie("es")).toBeNull();
    expect(readLanguageCookie(undefined)).toBeNull();
  });
});
