import { describe, expect, it } from "vitest";
import { axeViolations } from "./axe";

describe("axeViolations", () => {
  it("reports no violations for a labeled control", async () => {
    document.body.innerHTML = `
      <main id="main-content">
        <h1>Asebili</h1>
        <a class="skip-link" href="#main-content">Skip to content</a>
        <label for="email">Email</label>
        <input id="email" name="email" type="email" />
        <button type="button">Sign in</button>
      </main>
    `;
    expect(await axeViolations(document.body)).toEqual([]);
  });
});
