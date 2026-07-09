import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  resolve: {
    // hoisted pnpm 모노레포에서 react/react-dom이 여러 카피(top-level vs .pnpm)로 잡히면
    // 훅 dispatcher가 갈라져 "Invalid hook call"(useState null)이 난다. dedupe는 bare 스펙만
    // 고정하던 기존 alias와 달리 react/jsx-runtime 같은 서브패스까지 단일 카피로 강제한다.
    dedupe: ["react", "react-dom"],
  },
  test: {
    environment: "jsdom",
    include: ["**/*.test.{ts,tsx}"],
    exclude: ["e2e/**", "node_modules/**"],
    setupFiles: ["./vitest.setup.ts"],
    passWithNoTests: true,
    // 워크스페이스 패키지(@repo/ui 등)도 인라인 변환해 테스트와 동일한 react 카피를 쓰게 한다.
    server: { deps: { inline: [/@repo\//] } },
  },
});
