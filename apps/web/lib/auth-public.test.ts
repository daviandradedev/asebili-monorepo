import { afterEach, describe, expect, it, vi } from "vitest";
import { appBaseUrlForHost, authHubUrlForHost } from "./auth-public";

describe("public urls", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("keeps localhost targets on a local host", () => {
    vi.stubEnv("NEXT_PUBLIC_APP_URL", "http://localhost:3000");
    vi.stubEnv("NEXT_PUBLIC_AUTH_URL", "http://localhost:3100");

    expect(appBaseUrlForHost("localhost")).toBe("http://localhost:3000");
    expect(authHubUrlForHost("localhost")).toBe("http://localhost:3100");
  });

  it("ignores a localhost url when the site is the production host", () => {
    vi.stubEnv("NEXT_PUBLIC_APP_URL", "http://localhost:3000");
    vi.stubEnv("NEXT_PUBLIC_AUTH_URL", "http://localhost:3100");

    expect(appBaseUrlForHost("asebili-instructor.daviandrade.dev")).toBe(
      "https://asebili-instructor.daviandrade.dev",
    );
    expect(authHubUrlForHost("asebili-instructor.daviandrade.dev")).toBe(
      "https://auth.daviandrade.dev",
    );
  });

  it("uses the Vercel production host when the public url is missing", () => {
    vi.stubEnv("NEXT_PUBLIC_APP_URL", "");
    vi.stubEnv("NEXT_PUBLIC_AUTH_URL", "");
    vi.stubEnv("VERCEL_ENV", "production");
    vi.stubEnv("VERCEL_PROJECT_PRODUCTION_URL", "asebili-instructor.daviandrade.dev");

    expect(appBaseUrlForHost(null)).toBe("https://asebili-instructor.daviandrade.dev");
    expect(authHubUrlForHost(null)).toBe("https://auth.daviandrade.dev");
  });

  it("falls back to the known production url", () => {
    vi.stubEnv("NEXT_PUBLIC_APP_URL", "");
    vi.stubEnv("VERCEL_ENV", "production");
    vi.stubEnv("VERCEL_PROJECT_PRODUCTION_URL", "");

    expect(appBaseUrlForHost(null)).toBe("https://asebili-instructor.daviandrade.dev");
  });
});
