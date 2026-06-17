/**
 * Centralized auth/env resolution. Drives the dev(sqlite)/prod(postgres) split
 * and the cookie attributes (domain/SameSite/Secure) that the native WebView relies on.
 */

const isProd = process.env.NODE_ENV === "production";

export const authEnv = {
  isProd,
  /** "sqlite" for local dev, "postgres" for prod. */
  dialect: (process.env.DB_DIALECT ?? (isProd ? "postgres" : "sqlite")) as "sqlite" | "postgres",
  /** sqlite file path (dev) or postgres connection string (prod). */
  databaseUrl: process.env.DATABASE_URL ?? "./drizzle/dev.sqlite",
  secret: process.env.BETTER_AUTH_SECRET ?? "dev-insecure-secret-change-me",
  baseURL: process.env.BETTER_AUTH_URL ?? "http://localhost:3000",
  /**
   * Cookie domain shared between the Next.js web app and the native WebView.
   * Dev: undefined (host-only on localhost). Prod: e.g. ".example.com" so the
   * cookie is valid across subdomains the WebView may navigate to.
   */
  cookieDomain: process.env.AUTH_COOKIE_DOMAIN || undefined,
  /** Comma-separated list of origins allowed to hit the auth API (web + native dev tunnel). */
  trustedOrigins: (process.env.AUTH_TRUSTED_ORIGINS ?? "http://localhost:3000")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean),
} as const;
