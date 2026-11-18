import { config } from "dotenv";
import { readFileSync } from "node:fs";
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

const quizData = JSON.parse(
  readFileSync(resolve(root, "lib/demo-quiz-data.json"), "utf8"),
);

const client = new pg.Client({
  connectionString: normalizeDatabaseUrl(connectionString),
});

await client.connect();

for (const [activityId, jsonOptions] of Object.entries(quizData)) {
  const result = await client.query(
    `UPDATE asebili.activities
     SET json_options = $1::jsonb, updated_at = NOW()
     WHERE id = $2
     RETURNING title`,
    [JSON.stringify(jsonOptions), activityId],
  );

  if (result.rowCount === 0) {
    console.log(`skip ${activityId} (not in database)`);
  } else {
    console.log(`updated ${result.rows[0]?.title ?? activityId}`);
  }
}

await client.end();
