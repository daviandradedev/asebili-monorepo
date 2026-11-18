const LOCAL_HUB_URL = "http://localhost:3100";
const PRODUCTION_HUB_URL = "https://auth.daviandrade.dev";

function configured(value: string | undefined) {
  const trimmed = value?.trim();
  return trimmed || undefined;
}

export function isLocalHostname(hostname: string) {
  return hostname === "localhost" || hostname === "127.0.0.1" || hostname === "[::1]";
}

export function authHubUrlForHost(hostname: string | null | undefined, configuredUrl?: string) {
  const fromEnv = configured(configuredUrl);
  const hostIsLocal = hostname ? isLocalHostname(hostname) : true;
  let envIsLocal = false;
  if (fromEnv) {
    try {
      envIsLocal = isLocalHostname(new URL(fromEnv).hostname);
    } catch {
      envIsLocal = false;
    }
  }
  if (fromEnv && (hostIsLocal || !envIsLocal)) return fromEnv.replace(/\/$/, "");
  if (hostname && !hostIsLocal) return PRODUCTION_HUB_URL;
  return LOCAL_HUB_URL;
}

export function clientAuthHubUrl() {
  const hostname = typeof window !== "undefined" ? window.location.hostname : null;
  return authHubUrlForHost(hostname, process.env.EXPO_PUBLIC_AUTH_URL);
}
