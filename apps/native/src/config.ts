import Constants from "expo-constants";

/** WebView target + cookie domain, resolved from app.config.ts `extra`. */
const extra = (Constants.expoConfig?.extra ?? {}) as {
  webUrl?: string;
  cookieDomain?: string;
};

// Prefer the Metro-inlined env var: a dev build's embedded `extra` is frozen at
// native build time, so .env changes only take effect through process.env here.
export const WEB_URL = process.env.EXPO_PUBLIC_WEB_URL ?? extra.webUrl ?? "http://localhost:3000";
export const COOKIE_DOMAIN =
  process.env.EXPO_PUBLIC_COOKIE_DOMAIN ?? extra.cookieDomain ?? "localhost";

/** Origins the WebView is allowed to load. Anything else opens externally. */
export const ORIGIN_WHITELIST = [WEB_URL];
