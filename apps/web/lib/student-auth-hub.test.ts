import { describe, expect, it } from "vitest";
import { authHubUrlForHost } from "../../mobile/src/lib/auth-hub";
import { phoneFrameSize } from "../../mobile/src/layout";

describe("student auth hub url", () => {
  it("uses the local hub on localhost unless a local url is configured", () => {
    expect(authHubUrlForHost("localhost")).toBe("http://localhost:3100");
    expect(authHubUrlForHost("127.0.0.1", "http://localhost:3200/")).toBe("http://localhost:3200");
  });

  it("ignores a local hub url when the page is already public", () => {
    expect(authHubUrlForHost("asebili-student.daviandrade.dev", "http://localhost:3100")).toBe(
      "https://auth.daviandrade.dev",
    );
    expect(
      authHubUrlForHost("asebili-student.daviandrade.dev", "https://auth.daviandrade.dev"),
    ).toBe("https://auth.daviandrade.dev");
  });

  it("keeps a phone ratio when the viewport is taller than a handset", () => {
    const frame = phoneFrameSize(1440, 1200);
    expect(frame.height).toBeLessThanOrEqual(844);
    expect(frame.width / frame.height).toBeCloseTo(9 / 19.5, 2);
  });

  it("shrinks the handset to the space under the site chrome", () => {
    const frame = phoneFrameSize(730, 868);
    expect(frame.width).toBeLessThan(400);
    expect(frame.height).toBeLessThan(868);
    expect(frame.width / frame.height).toBeCloseTo(9 / 19.5, 2);
  });
});
