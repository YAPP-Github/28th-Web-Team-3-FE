import { withSentryConfig } from "@sentry/nextjs";
import type { NextConfig } from "next";

const backendApiUrl = process.env.BACKEND_API_URL?.replace(/\/$/, "");

const nextConfig: NextConfig = {
  reactStrictMode: true,
  allowedDevOrigins: ["10.0.2.2"],
  async rewrites() {
    if (!backendApiUrl) {
      if (process.env.NODE_ENV === "production") {
        throw new Error("BACKEND_API_URL is required in production");
      }
      return [];
    }
    return [
      {
        source: "/api/:path*",
        destination: `${backendApiUrl}/api/:path*`,
      },
    ];
  },
  // 내부 패키지는 빌드 없이 TS/TSX 소스를 그대로 내보내므로 Next가 여기서 컴파일한다.
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

  // 스택 트레이스를 읽을 수 있게 소스맵을 업로드한다(CI 전용, SENTRY_AUTH_TOKEN 필요).
  authToken: process.env.SENTRY_AUTH_TOKEN,

  // SDK 요청을 우리 도메인으로 우회시켜 광고 차단기를 피한다.
  tunnelRoute: "/monitoring",

  // CI가 아니면 빌드 로그를 조용히 한다.
  silent: !process.env.CI,
});
