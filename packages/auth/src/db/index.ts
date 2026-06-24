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
const isPostgres = authEnv.dialect === "postgres";

// `provider`/`schema` are pure config — safe to resolve eagerly without a connection.
export const provider = isPostgres ? ("pg" as const) : ("sqlite" as const);
export const schema = isPostgres ? pgSchema.schema : sqliteSchema.schema;

function connect() {
  if (isPostgres) {
    const client = postgres(authEnv.databaseUrl, { prepare: false });
    return drizzlePg(client, { schema: pgSchema.schema });
  }
  const sqlite = new Database(authEnv.databaseUrl);
  sqlite.pragma("journal_mode = WAL");
  return drizzleSqlite(sqlite, { schema: sqliteSchema.schema });
}

export type AppDatabase = ReturnType<typeof connect>;

// Connect lazily on first use so `next build` (which imports the auth route) never
// opens a DB connection at module load — only the actual request does.
let connection: AppDatabase | undefined;
export const db: AppDatabase = new Proxy({} as AppDatabase, {
  get(_target, prop) {
    connection ??= connect();
    const value = Reflect.get(connection as object, prop);
    return typeof value === "function" ? value.bind(connection) : value;
  },
});
