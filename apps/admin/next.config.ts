import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // 내부 패키지가 TS/TSX 소스 그대로 배포되므로 Next가 여기서 컴파일한다.
  transpilePackages: ["@repo/ui", "@repo/api"],
};

export default nextConfig;
