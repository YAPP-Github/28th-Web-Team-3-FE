import Constants from "expo-constants";

/** WebView target + cookie domain, resolved from app.config.ts `extra`. */
const extra = (Constants.expoConfig?.extra ?? {}) as {
  webUrl?: string;
  cookieDomain?: string;
};

export const WEB_URL = extra.webUrl ?? "http://localhost:3000";
export const COOKIE_DOMAIN = extra.cookieDomain ?? "localhost";

/** Origins the WebView is allowed to load. Anything else opens externally. */
export const ORIGIN_WHITELIST = [WEB_URL];
