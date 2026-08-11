import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import { defineConfig, type Plugin } from "vitest/config";

// 런타임(SVGR)처럼 .svg import를 React 컴포넌트로 취급 — 테스트에선 빈 <svg> 스텁으로 충분.
const svgComponentStub: Plugin = {
  name: "svg-component-stub",
  enforce: "pre",
  load(id) {
    if (id.endsWith(".svg")) {
      return 'import { createElement } from "react"; export default (props) => createElement("svg", props);';
    }
  },
};

export default defineConfig({
  plugins: [svgComponentStub, react()],
  resolve: {
    // Next는 tsconfig paths를 자동으로 읽지만 Vitest는 읽지 않는다. `@/*` alias를 여기에
    // 다시 선언해 앱 코드와 테스트가 같은 경로로 모듈을 찾게 한다 (tsconfig.json과 동기화 필요).
    alias: [
      // Vercel은 프로젝트 루트의 `api/`를 Functions로 취급한다. 공개 import 경로는 유지하되
      // 실제 HTTP 모듈은 예약 디렉터리 밖 `src/api/`에서 찾는다.
      {
        find: /^@\/api(?=\/|$)/,
        replacement: fileURLToPath(new URL("./src/api", import.meta.url)),
      },
      { find: "@", replacement: fileURLToPath(new URL("./", import.meta.url)) },
    ],
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
