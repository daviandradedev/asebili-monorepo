import { config } from "dotenv";
import { dirname, resolve } from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";
import pg from "pg";
import { normalizeDatabaseUrl } from "../lib/database-url.mjs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
config({ path: resolve(root, ".env.local") });

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error("DATABASE_URL is missing in apps/web/.env.local");
  process.exit(1);
}

const client = new pg.Client({
  connectionString: normalizeDatabaseUrl(connectionString),
});

await client.connect();

const check = await client.query(`
  SELECT column_name
  FROM information_schema.columns
  WHERE table_schema = 'asebili'
    AND table_name = 'performance_logs'
    AND column_name = 'answer_details'
`);

if (check.rows.length === 0) {
  await client.query(`
    ALTER TABLE "asebili"."performance_logs"
    ADD COLUMN IF NOT EXISTS "answer_details" jsonb DEFAULT null
  `);
  console.log("added performance_logs.answer_details");
} else {
  console.log("performance_logs.answer_details already exists");
}

await client.end();
