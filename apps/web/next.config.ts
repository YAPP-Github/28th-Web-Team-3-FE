import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Internal packages ship TS/TSX source; Next compiles them here.
  transpilePackages: ["@repo/ui", "@repo/api", "@repo/schema", "@repo/bridge"],
};

export default nextConfig;
