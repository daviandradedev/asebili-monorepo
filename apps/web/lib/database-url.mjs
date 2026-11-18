const LEGACY_SSL_MODES = new Set(["prefer", "require", "verify-ca"]);

export function normalizeDatabaseUrl(connectionString) {
  try {
    const parsed = new URL(connectionString);
    const sslmode = parsed.searchParams.get("sslmode");

    if (
      parsed.searchParams.get("uselibpqcompat") !== "true" &&
      sslmode &&
      LEGACY_SSL_MODES.has(sslmode)
    ) {
      parsed.searchParams.set("sslmode", "verify-full");
      return parsed.toString();
    }
  } catch {
    return connectionString;
  }

  return connectionString;
}
