import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db, provider, schema } from "./db";
import { authEnv } from "./env";

/**
 * Better Auth server instance. Lives only in the web app (Next.js route handler);
 * the native app never runs this — it shares the resulting session cookie.
 *
 * Cookie attributes are env-driven so the native WebView can share the web session:
 *  - dev:  host-only cookie on localhost, SameSite=Lax, Secure=false (http)
 *  - prod: domain-scoped cookie (AUTH_COOKIE_DOMAIN), SameSite=Lax, Secure=true
 */
export const auth = betterAuth({
  baseURL: authEnv.baseURL,
  secret: authEnv.secret,
  trustedOrigins: authEnv.trustedOrigins,
  database: drizzleAdapter(db, { provider, schema }),
  emailAndPassword: {
    enabled: true,
  },
  session: {
    expiresIn: 60 * 60 * 24 * 30, // 30 days — survives app relaunches via injected cookie
    cookieCache: { enabled: true, maxAge: 60 * 5 },
  },
  advanced: {
    useSecureCookies: authEnv.isProd,
    defaultCookieAttributes: {
      sameSite: "lax",
      secure: authEnv.isProd,
      httpOnly: true,
    },
    ...(authEnv.cookieDomain
      ? { crossSubDomainCookies: { enabled: true, domain: authEnv.cookieDomain } }
      : {}),
  },
});

export type Auth = typeof auth;
