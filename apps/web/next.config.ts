import { withSentryConfig } from "@sentry/nextjs";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Internal packages ship TS/TSX source; Next compiles them here.
  transpilePackages: ["@repo/ui", "@repo/api", "@repo/schema", "@repo/bridge"],
};

export default withSentryConfig(nextConfig, {
  org: "yapp-web3",
  project: "javascript-nextjs",

  // Upload source maps for readable stack traces (CI; needs SENTRY_AUTH_TOKEN).
  authToken: process.env.SENTRY_AUTH_TOKEN,

  // Route SDK requests through our own domain to dodge ad-blockers.
  tunnelRoute: "/monitoring",

  // Quiet build logs except on CI.
  silent: !process.env.CI,
});
