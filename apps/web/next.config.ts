import { withSentryConfig } from "@sentry/nextjs";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Internal packages ship TS/TSX source; Next compiles them here.
  transpilePackages: ["@repo/ui", "@repo/api", "@repo/schema", "@repo/bridge"],
  // .svg import를 SVGR로 React 컴포넌트화 (fill=currentColor로 색상 제어).
  // dev는 --webpack, build는 Turbopack이라 양쪽 모두 설정해야 한다.
  turbopack: {
    rules: {
      "*.svg": {
        loaders: ["@svgr/webpack"],
        as: "*.js",
      },
    },
  },
  webpack(config) {
    const fileLoaderRule = config.module.rules.find(
      (rule: { test?: { test?: (s: string) => boolean } }) => rule.test?.test?.(".svg"),
    );
    fileLoaderRule.exclude = /\.svg$/i;
    config.module.rules.push({
      test: /\.svg$/i,
      issuer: fileLoaderRule.issuer,
      use: ["@svgr/webpack"],
    });
    return config;
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
