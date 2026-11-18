import { describe, expect, it } from "vitest";
import { accountInitials } from "./account-profile";

describe("account initials", () => {
  it("uses the first letter of the first two names", () => {
    expect(accountInitials("Davi Andrade", "daviandrade.dev@gmail.com")).toBe("DA");
  });

  it("uses the email when the name is empty", () => {
    expect(accountInitials("  ", "ada@example.com")).toBe("AD");
  });

  it("uses a question mark when both are empty", () => {
    expect(accountInitials("", " ")).toBe("?");
  });
});
