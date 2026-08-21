import "@testing-library/jest-dom/vitest";
import * as matchers from "@testing-library/jest-dom/matchers";
import { cleanup } from "@testing-library/react";
import { afterEach, expect, vi } from "vitest";

expect.extend(matchers);

vi.stubGlobal(
  "ResizeObserver",
  class {
    observe() {}
    unobserve() {}
    disconnect() {}
  },
);

// jsdom에는 없다. 교차를 실제로 흉내 내야 하는 테스트는 각자 다시 stub한다.
vi.stubGlobal(
  "IntersectionObserver",
  class {
    observe() {}
    unobserve() {}
    disconnect() {}
  },
);

// jsdom에 포인터 캡처가 없다. 바텀시트가 끌기 시작할 때 부르므로, 없으면 드래그 테스트가
// 동작이 아니라 이 빈자리 때문에 죽는다.
Element.prototype.setPointerCapture ??= () => {};

afterEach(() => {
  cleanup();
});
