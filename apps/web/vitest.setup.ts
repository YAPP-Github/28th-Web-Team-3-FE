// vitest expect의 타입 증강(Assertion에 toBeInTheDocument 등 추가)
import "@testing-library/jest-dom/vitest";
import * as matchers from "@testing-library/jest-dom/matchers";
import { cleanup } from "@testing-library/react";
import { afterEach, expect } from "vitest";

// jest-dom 매처를 vitest expect에 런타임 등록
expect.extend(matchers);

// 각 테스트 후 렌더된 DOM 정리 (테스트 간 격리)
afterEach(() => {
  cleanup();
});
