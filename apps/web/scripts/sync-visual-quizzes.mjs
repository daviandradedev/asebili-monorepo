import { config } from "dotenv";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";
import pg from "pg";

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

const activityMatchers = [
  {
    pattern: /cores|colors/i,
    key: "demo-act-colors",
    title: "Colors in Portuguese",
  },
  {
    pattern: /fam[ií]lia|family/i,
    key: "demo-act-family",
    title: "My family",
  },
  {
    pattern: /animais|animals/i,
    key: null,
    title: "Animals: Portuguese words",
  },
  {
    pattern: /n[uú]meros|numbers/i,
    key: null,
    title: "Numbers 1 to 5",
  },
];

const classMatchers = [
  {
    pattern: /manh[aã]|morning|3[oº]?\s*ano\s*a|grade\s*3a/i,
    name: "Grade 3A — Morning",
  },
  {
    pattern: /tarde|afternoon|3[oº]?\s*ano\s*b|grade\s*3b/i,
    name: "Grade 3B — Afternoon",
  },
];

const client = new pg.Client({ connectionString });
await client.connect();

for (const { pattern, key, title } of activityMatchers) {
  const jsonOptions = key ? quizData[key] : null;

  const result = await client.query(
    jsonOptions
      ? `UPDATE asebili.activities
         SET title = $3, json_options = $1::jsonb, updated_at = NOW()
         WHERE template_type = 'quiz' AND title ~* $2
         RETURNING id, title`
      : `UPDATE asebili.activities
         SET title = $2, updated_at = NOW()
         WHERE title ~* $1
         RETURNING id, title`,
    jsonOptions
      ? [JSON.stringify(jsonOptions), pattern.source, title]
      : [pattern.source, title],
  );

  if (result.rowCount === 0) {
    console.log(`skip activity ${pattern} (no match)`);
  } else {
    for (const row of result.rows) {
      console.log(`activity: ${row.title} (${row.id})`);
    }
  }
}

for (const { pattern, name } of classMatchers) {
  const result = await client.query(
    `UPDATE asebili.classes
     SET name = $2, updated_at = NOW()
     WHERE name ~* $1
     RETURNING id, name`,
    [pattern.source, name],
  );

  if (result.rowCount === 0) {
    console.log(`skip class ${pattern} (no match)`);
  } else {
    for (const row of result.rows) {
      console.log(`class: ${row.name} (${row.id})`);
    }
  }
}

const afternoonByActivity = await client.query(
  `UPDATE asebili.classes AS c
   SET name = 'Grade 3B — Afternoon', updated_at = NOW()
   FROM asebili.class_activities AS ca
   INNER JOIN asebili.activities AS a ON a.id = ca.activity_id
   WHERE ca.class_id = c.id
     AND a.title ~* $1
   RETURNING c.id, c.name`,
  ["family|numbers|fam[ií]lia|n[uú]meros"],
);

for (const row of afternoonByActivity.rows) {
  console.log(`class (by activity): ${row.name} (${row.id})`);
}

const morningByActivity = await client.query(
  `UPDATE asebili.classes AS c
   SET name = 'Grade 3A — Morning', updated_at = NOW()
   FROM asebili.class_activities AS ca
   INNER JOIN asebili.activities AS a ON a.id = ca.activity_id
   WHERE ca.class_id = c.id
     AND a.title ~* $1
     AND c.name !~* $2
   RETURNING c.id, c.name`,
  ["colors|animals|cores|animais", "afternoon|tarde|3b"],
);

for (const row of morningByActivity.rows) {
  console.log(`class (by activity): ${row.name} (${row.id})`);
}

await client.end();
