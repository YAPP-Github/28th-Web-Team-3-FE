import { type NextRequest, NextResponse } from "next/server";

/**
 * Lightweight session gate. Better Auth sets a session cookie (prefix "better-auth").
 * We only check presence here — full validation happens in the route handlers /
 * server components. This same cookie is what the native shell injects into the WebView.
 */
const PROTECTED_PREFIXES = ["/app", "/dashboard"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isProtected = PROTECTED_PREFIXES.some((p) => pathname.startsWith(p));
  if (!isProtected) return NextResponse.next();

  const hasSession = request.cookies
    .getAll()
    .some((c) => c.name.startsWith("better-auth.session_token"));

  if (!hasSession) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("from", pathname);
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/app/:path*", "/dashboard/:path*"],
};
