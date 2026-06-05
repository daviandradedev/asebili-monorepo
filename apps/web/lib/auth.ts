import { betterAuth } from "better-auth";
import { pool } from "./db";

function toHttpsOrigin(host?: string) {
  if (!host) return undefined;
  const trimmedHost = host.trim();
  if (!trimmedHost) return undefined;
  return trimmedHost.startsWith("http")
    ? trimmedHost
    : `https://${trimmedHost}`;
}

function normalizeOrigin(value?: string) {
  const candidate = toHttpsOrigin(value);
  if (!candidate) return undefined;
  try {
    return new URL(candidate).origin;
  } catch {
    return undefined;
  }
}

const trustedOrigins = [
  process.env.BETTER_AUTH_URL,
  process.env.VERCEL_URL,
  process.env.VERCEL_BRANCH_URL,
  process.env.VERCEL_PROJECT_PRODUCTION_URL,
  ...(process.env.BETTER_AUTH_TRUSTED_ORIGINS?.split(",") ?? []),
  "https://*.vercel.app",
  "http://localhost:3000",
  "http://127.0.0.1:3000",
]
  .map((origin) => normalizeOrigin(origin) ?? origin?.trim())
  .filter((origin): origin is string => Boolean(origin));

const baseURL = normalizeOrigin(process.env.BETTER_AUTH_URL);

const cookieDomain = process.env.BETTER_AUTH_COOKIE_DOMAIN?.trim();

export const auth = betterAuth({
  database: pool,
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL,
  trustedOrigins,
  advanced: cookieDomain
    ? {
        crossSubDomainCookies: {
          enabled: true,
          domain: cookieDomain,
        },
      }
    : undefined,
  emailAndPassword: {
    enabled: true,
    autoSignIn: true,
    minPasswordLength: 8,
    maxPasswordLength: 128,
  },
});
