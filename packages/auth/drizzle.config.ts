import { defineConfig } from "drizzle-kit";

/**
 * Dev default: SQLite. For prod migrations run with DB_DIALECT=postgres and a
 * Postgres DATABASE_URL, pointing schema at ./src/db/schema.pg.ts.
 */
const dialect = (process.env.DB_DIALECT ?? "sqlite") as "sqlite" | "postgres";
const isPg = dialect === "postgres";

export default defineConfig({
  dialect: isPg ? "postgresql" : "sqlite",
  schema: isPg ? "./src/db/schema.pg.ts" : "./src/db/schema.ts",
  out: "./drizzle",
  dbCredentials: isPg
    ? { url: process.env.DATABASE_URL ?? "" }
    : { url: process.env.DATABASE_URL ?? "./drizzle/dev.sqlite" },
});
