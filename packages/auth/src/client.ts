import { createAuthClient } from "better-auth/react";

/**
 * Browser-side auth client. Used by the web app and — since the native shell loads
 * that same web app inside a WebView — implicitly by native too.
 * `baseURL` defaults to same-origin; override via NEXT_PUBLIC_AUTH_URL if the API is split out.
 */
export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_AUTH_URL || undefined,
  fetchOptions: {
    credentials: "include",
  },
});

export const { signIn, signUp, signOut, useSession, getSession } = authClient;
