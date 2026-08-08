import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // 내부 패키지는 빌드 없이 TS/TSX 소스를 그대로 내보내므로 Next가 여기서 컴파일한다.
  transpilePackages: ["@repo/ui", "@repo/api"],
};

export default nextConfig;
