import { defineConfig } from "drizzle-kit";
import { config } from "dotenv";

config({ path: "apps/web/.env.local" });
config({ path: ".env.local" });
config();

export default defineConfig({
  schema: "./packages/database/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL ?? "",
  },
});
