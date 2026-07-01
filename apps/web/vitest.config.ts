import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

// 워크스페이스 루트의 단일 react/react-dom을 절대경로로 못박아 인스턴스 중복 방지
const rootModules = fileURLToPath(new URL("../../node_modules", import.meta.url));

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      react: `${rootModules}/react`,
      "react-dom": `${rootModules}/react-dom`,
    },
  },
  test: {
    environment: "jsdom",
    include: ["**/*.test.{ts,tsx}"],
    exclude: ["e2e/**", "node_modules/**"],
    setupFiles: ["./vitest.setup.ts"],
    passWithNoTests: true,
    setupFiles: ["./vitest.setup.ts"],
  },
});
