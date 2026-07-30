import { withSentryConfig } from "@sentry/nextjs";
import type { NextConfig } from "next";

const backendApiUrl = process.env.BACKEND_API_URL?.replace(/\/$/, "");

const nextConfig: NextConfig = {
  reactStrictMode: true,
  allowedDevOrigins: ["10.0.2.2"],
  async rewrites() {
    if (process.env.NODE_ENV !== "development" || !backendApiUrl) return [];
    return [
      {
        source: "/api/:path*",
        destination: `${backendApiUrl}/api/:path*`,
      },
    ];
  },
  // Internal packages ship TS/TSX source; Next compiles them here.
  transpilePackages: ["@repo/ui", "@repo/api", "@repo/schema", "@repo/bridge"],
  reactCompiler: true,
  // .svg import를 SVGR로 React 컴포넌트화 (fill=currentColor로 색상 제어).
  turbopack: {
    rules: {
      "*.svg": {
        loaders: ["@svgr/webpack"],
        as: "*.js",
      },
    },
  },
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
