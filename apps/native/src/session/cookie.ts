import CookieManager from "@preeternal/react-native-cookie-manager";
import { COOKIE_DOMAIN, WEB_URL } from "../config";
import { loadSessionCookie, saveSessionCookie } from "./secureStore";

/**
 * WebView <-> web session bridge (decision: web-owned + cookie injection).
 *
 * Two directions:
 *  1. INJECT  (boot): restore the persisted Better Auth session cookie into the
 *     native cookie store BEFORE the WebView navigates, so the web loads logged-in.
 *  2. CAPTURE (after web login): read the cookie the web app set inside the WebView
 *     (visible to native because sharedCookiesEnabled), then persist it.
 *
 * Better Auth's session cookie name is prefixed "better-auth.session_token".
 */
const SESSION_COOKIE_NAME = "better-auth.session_token";
const isProd = process.env.NODE_ENV === "production";

/** Inject the stored session cookie into the WebView before first navigation. */
export async function injectStoredCookie(): Promise<boolean> {
  const value = await loadSessionCookie();
  if (!value) return false;

  await CookieManager.set(WEB_URL, {
    name: SESSION_COOKIE_NAME,
    value,
    domain: COOKIE_DOMAIN,
    path: "/",
    // dev over http: Secure must be false or WKWebView drops the cookie.
    secure: isProd,
    httpOnly: true,
    // first-party login inside the WebView -> Lax is sufficient.
  });
  return true;
}

/** Read the session cookie the web app set, and persist it for next launch. */
export async function captureCookieFromWebView(): Promise<boolean> {
  const cookies = await CookieManager.get(WEB_URL);
  const session = cookies[SESSION_COOKIE_NAME];
  if (!session?.value) return false;
  await saveSessionCookie(session.value);
  return true;
}
