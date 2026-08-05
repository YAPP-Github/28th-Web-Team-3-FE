import { defineConfig } from "vitest/config";

// 네이티브 앱 전체가 아니라 RN 런타임에 의존하지 않는 순수 로직만 테스트한다.
// 화면·브릿지 동작은 시뮬레이터에서 확인한다.
export default defineConfig({
  // RN이 런타임에 넣어주는 전역. 테스트에는 없어서 참조하는 모듈이 ReferenceError로 죽는다.
  define: { __DEV__: "true" },
  test: {
    include: ["src/**/*.test.ts"],
    environment: "node",
  },
});
