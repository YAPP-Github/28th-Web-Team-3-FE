import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Internal packages ship TS/TSX source; Next compiles them here.
  transpilePackages: ["@repo/ui", "@repo/api", "@repo/auth", "@repo/schema", "@repo/bridge"],
  serverExternalPackages: ["better-sqlite3", "postgres"],
};

export default nextConfig;
