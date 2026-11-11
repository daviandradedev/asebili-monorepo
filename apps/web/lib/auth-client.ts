"use client";

import { createAuthClient } from "better-auth/react";
import { authHubUrlForHost, clientAppBaseUrl } from "./auth-public";

export const authClient: ReturnType<typeof createAuthClient> = createAuthClient({
  baseURL: clientAppBaseUrl(),
});

export function redirectToAuthLogin(callbackPath?: string) {
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
