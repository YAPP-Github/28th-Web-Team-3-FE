import { defineConfig } from "vitest/config";

// 네이티브 앱 전체가 아니라 RN 런타임에 의존하지 않는 순수 로직만 테스트한다.
// 화면·브릿지 동작은 시뮬레이터에서 확인한다.
export default defineConfig({
  test: {
    include: ["src/**/*.test.ts"],
    environment: "node",
  },
});
