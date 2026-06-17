import Database from "better-sqlite3";
import { drizzle as drizzleSqlite } from "drizzle-orm/better-sqlite3";
import { drizzle as drizzlePg } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { authEnv } from "../env";
import * as sqliteSchema from "./schema";
import * as pgSchema from "./schema.pg";

/**
 * Driver split: SQLite (better-sqlite3) for local dev, Postgres (postgres-js) for prod.
 * Schema columns are mirrored between dialects, so app code stays dialect-agnostic.
 * Exports `provider` for the Better Auth drizzleAdapter ("sqlite" | "pg").
 */
function createDb() {
  if (authEnv.dialect === "postgres") {
    const client = postgres(authEnv.databaseUrl, { prepare: false });
    return {
      db: drizzlePg(client, { schema: pgSchema.schema }),
      schema: pgSchema.schema,
      provider: "pg" as const,
    };
  }

  const sqlite = new Database(authEnv.databaseUrl);
  sqlite.pragma("journal_mode = WAL");
  return {
    db: drizzleSqlite(sqlite, { schema: sqliteSchema.schema }),
    schema: sqliteSchema.schema,
    provider: "sqlite" as const,
  };
}

export const { db, schema, provider } = createDb();
export type AppDatabase = typeof db;
