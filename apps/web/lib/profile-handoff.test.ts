import { describe, expect, it } from "vitest";
import { hubAccountHandoffUrl, safeNextPath } from "./profile-handoff";
import { shouldRefreshSession } from "./session-refresh";

describe("profile handoff", () => {
  it("sends the one-time token to the hub account bootstrap", () => {
    const target = hubAccountHandoffUrl("https://auth.daviandrade.dev/", "token-1");

    expect(target.origin).toBe("https://auth.daviandrade.dev");
    expect(target.pathname).toBe("/api/auth/bootstrap");
    expect(target.searchParams.get("ott")).toBe("token-1");
    expect(target.searchParams.get("next")).toBe("/account");
  });

  it("only returns to local paths after sign-in", () => {
    expect(safeNextPath("/dashboard/activities/new")).toBe("/dashboard/activities/new");
    expect(safeNextPath(null)).toBe("/");
    expect(safeNextPath("https://evil.example")).toBe("/");
    expect(safeNextPath("//evil.example")).toBe("/");
  });
});

describe("shouldRefreshSession", () => {
  const now = Date.UTC(2026, 10, 5, 12);

  it("refreshes when never renewed or a day has passed", () => {
    expect(shouldRefreshSession(null, now)).toBe(true);
    expect(shouldRefreshSession(String(now - 25 * 60 * 60 * 1000), now)).toBe(true);
  });

  it("skips when renewed in the last day", () => {
    expect(shouldRefreshSession(String(now - 60 * 60 * 1000), now)).toBe(false);
  });
});
