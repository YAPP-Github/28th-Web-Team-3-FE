import CookieManager from "@preeternal/react-native-cookie-manager";
import { COOKIE_DOMAIN, WEB_URL } from "../config";
import { loadSessionCookie, saveSessionCookie } from "./secureStore";

/**
 * WebView <-> web session bridge (decision: server-owned session + cookie injection).
 *
 * Auth is owned by the Spring backend; it sets the session cookie on login.
 *
 * Two directions:
 *  1. INJECT  (boot): restore the persisted session cookie into the native cookie
 *     store BEFORE the WebView navigates, so the web loads logged-in.
 *  2. CAPTURE (after web login): read the session cookie set inside the WebView
 *     (visible to native because sharedCookiesEnabled), then persist it.
 *
 * SESSION_COOKIE_NAME must match the Spring backend's session cookie — default is
 * Spring's HttpSession cookie (JSESSIONID); change it if the server uses a custom
 * or JWT cookie name.
 *
 * NOTE: this bridge assumes the session cookie lives on WEB_URL (web and backend
 * same-origin, or a shared parent domain). If the Spring backend is on a different
 * domain, the cookie won't ride along — this inject/capture approach must be
 * redesigned, not merely retargeted.
 */
const SESSION_COOKIE_NAME = "JSESSIONID";
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
