"use client";

import { translate } from "@asebili/i18n";
import { createAuthClient } from "better-auth/react";
import { redirectLanguage } from "./auth-redirect";
import { authHubUrlForHost, clientAppBaseUrl } from "./auth-public";

export const authClient: ReturnType<typeof createAuthClient> = createAuthClient({
  baseURL: clientAppBaseUrl(),
});

function storedLanguage() {
  try {
    return window.localStorage.getItem("language");
  } catch {
    return null;
  }
}

export function showAuthRedirectOverlay() {
  if (typeof document === "undefined") return;
  if (document.getElementById("auth-redirect-overlay")) return;
  const language = redirectLanguage(document.cookie, storedLanguage());
  const root = document.createElement("div");
  root.id = "auth-redirect-overlay";
  root.className = "redirect-screen";
  root.setAttribute("role", "status");
  root.setAttribute("aria-live", "polite");
  const spinner = document.createElement("div");
  spinner.className = "redirect-spinner";
  spinner.setAttribute("aria-hidden", "true");
  const title = document.createElement("p");
  title.className = "redirect-title";
  title.textContent = translate(language, "redirect.openingAccount");
  root.append(spinner, title);
  document.body.append(root);
}

export function redirectToAuthAccount() {
  showAuthRedirectOverlay();
  window.location.assign("/api/auth/handoff");
}

export function redirectToAuthLogin(callbackPath?: string) {
  showAuthRedirectOverlay();
  const login = new URL(authHubUrlForHost(window.location.hostname));
  const callback = callbackPath
    ? new URL(callbackPath, window.location.origin).toString()
    : window.location.href;
  login.searchParams.set("callbackURL", callback);
  window.location.assign(login.toString());
}

export function saveWasRejected(response: Response) {
  if (response.status !== 401) return false;
  redirectToAuthLogin();
  return true;
}
