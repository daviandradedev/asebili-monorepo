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

const trustedOrigins = [
  process.env.BETTER_AUTH_URL,
  toHttpsOrigin(process.env.VERCEL_URL),
  toHttpsOrigin(process.env.VERCEL_BRANCH_URL),
  toHttpsOrigin(process.env.VERCEL_PROJECT_PRODUCTION_URL),
  ...(process.env.BETTER_AUTH_TRUSTED_ORIGINS?.split(",") ?? []),
]
  .map((origin) => origin?.trim())
  .filter((origin): origin is string => Boolean(origin));

const cookieDomain = process.env.BETTER_AUTH_COOKIE_DOMAIN?.trim();

export const auth = betterAuth({
  database: pool,
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.BETTER_AUTH_URL,
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
