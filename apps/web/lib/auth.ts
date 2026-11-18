import { betterAuth } from "better-auth";
import { toNextJsHandler } from "better-auth/next-js";
import { bearer, oneTimeToken } from "better-auth/plugins";
import { Pool } from "pg";
import { appBaseUrlForHost, authHubUrlForHost } from "./auth-public";

function parseOrigins(value: string | undefined) {
  return (value ?? "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
}

const cookieDomain = process.env.BETTER_AUTH_COOKIE_DOMAIN?.trim();
const appUrl = appBaseUrlForHost();
const authHubUrl = authHubUrlForHost();

const globalForAuth = globalThis as typeof globalThis & {
  asebiliAuthPool?: Pool;
};

const authPool =
  globalForAuth.asebiliAuthPool ??
  new Pool({
    connectionString: process.env.AUTH_DATABASE_URL,
    max: 5,
  });

if (process.env.NODE_ENV !== "production") {
  globalForAuth.asebiliAuthPool = authPool;
}

const auth = betterAuth({
  database: authPool,
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: appUrl,
  trustedOrigins: [
    authHubUrl,
    appUrl,
    ...parseOrigins(process.env.BETTER_AUTH_TRUSTED_ORIGINS),
  ],
  advanced: cookieDomain
    ? {
        crossSubDomainCookies: {
          enabled: true,
          domain: cookieDomain,
        },
      }
    : undefined,
  session: {
    expiresIn: 60 * 60 * 24 * 30,
    updateAge: 60 * 60 * 24,
  },
  emailAndPassword: {
    enabled: true,
    disableSignUp: true,
  },
  plugins: [bearer(), oneTimeToken()],
});

export const authRouteHandlers = toNextJsHandler(auth);

export function readSession(headers: Headers) {
  return auth.api.getSession({ headers, query: { disableRefresh: true } });
}

export function issueOneTimeToken(headers: Headers) {
  return auth.api.generateOneTimeToken({ headers });
}

export function verifyOneTimeToken(request: Request, token: string) {
  return auth.handler(
    new Request(new URL("/api/auth/one-time-token/verify", request.url), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    }),
  );
}
