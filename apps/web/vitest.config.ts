import { createRequire } from "node:module";
import { dirname } from "node:path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

// react/react-dom을 실제 설치 위치로 동적 해석해 단일 인스턴스로 고정.
// 경로를 하드코딩하지 않고 require.resolve로 찾으므로 설치 레이아웃(hoisted/isolated)에 무관.
const require = createRequire(import.meta.url);
const reactPath = dirname(require.resolve("react/package.json"));
const reactDomPath = dirname(require.resolve("react-dom/package.json"));

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      react: reactPath,
      "react-dom": reactDomPath,
    },
  },
  test: {
    environment: "jsdom",
    include: ["**/*.test.{ts,tsx}"],
    exclude: ["e2e/**", "node_modules/**"],
    setupFiles: ["./vitest.setup.ts"],
    passWithNoTests: true,
  },
});
