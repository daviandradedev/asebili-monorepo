export const SESSION_REFRESH_KEY = "session-refreshed-at";

const DAY_MS = 24 * 60 * 60 * 1000;

export function shouldRefreshSession(lastRefreshed: string | null, now = Date.now()) {
  return now - Number(lastRefreshed ?? 0) >= DAY_MS;
}
