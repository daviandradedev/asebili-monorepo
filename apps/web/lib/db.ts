import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "@asebili/database/schema";

const globalForDb = globalThis as unknown as {
  asebiliPool?: Pool;
};

const connectionString = process.env.DATABASE_URL;
const configuredPoolMax = Number.parseInt(
  process.env.DATABASE_POOL_MAX ?? "5",
  10,
);

export function assertDatabaseConfigured() {
  if (!connectionString) {
    throw new Error(
      "DATABASE_URL is required. Configure it with your pooled Postgres connection string.",
    );
  }
}

export const pool =
  globalForDb.asebiliPool ??
  new Pool({
    connectionString,
    max: Number.isFinite(configuredPoolMax) ? configuredPoolMax : 5,
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 10_000,
  });

if (process.env.NODE_ENV !== "production") {
  globalForDb.asebiliPool = pool;
}

export const db = drizzle(pool, { schema });
