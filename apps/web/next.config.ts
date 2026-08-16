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
  /**
   * 저장 목록이 필터 칩에서 별도 화면으로 빠지기 전의 링크.
   *
   * 페이지에서 `await searchParams`로 처리하면 그것만으로 `/benefits`가 동적 렌더로 바뀐다 —
   * 탭을 누를 때마다 서버 왕복을 기다리게 되고, 다른 탭은 전부 정적이라 혜택만 느려진다.
   * 여기서 처리하면 페이지는 정적으로 남는다.
   */
  async redirects() {
    return [
      {
        source: "/benefits",
        has: [{ type: "query", key: "category", value: "saved" }],
        destination: "/benefits/saved",
        permanent: false,
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
