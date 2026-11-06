"use client";

import { createAuthClient } from "better-auth/react";
import { authHubUrlForHost, clientAppBaseUrl } from "./auth-public";

export const authClient: ReturnType<typeof createAuthClient> = createAuthClient({
  baseURL: clientAppBaseUrl(),
});

export function redirectToAuthLogin(callbackPath = "/dashboard") {
  const login = new URL(authHubUrlForHost(window.location.hostname));
  login.searchParams.set("callbackURL", new URL(callbackPath, window.location.origin).toString());
  window.location.assign(login.toString());
}
