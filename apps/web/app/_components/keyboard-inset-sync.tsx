"use client";

import { useEffect } from "react";

/**
 * 화면을 가린 키보드 높이를 `--keyboard-inset`으로 흘린다. 하단 버튼을 둔 화면이
 * `calc(... - var(--keyboard-inset, 0px))`으로 높이를 줄여 버튼을 키보드 위로 올린다.
 *
 * 플랫폼 기본 동작에 기대지 않고 직접 재는 이유:
 * - iOS는 키보드가 떠도 레이아웃 뷰포트를 줄이지 않는다. `100dvh`가 그대로라 흐름 맨 아래에
 *   있는 버튼이 키보드 뒤에 깔린다.
 * - Android는 줄이는 경우가 있지만 `interactive-widget` 기본 해석이 크롬 버전마다 달라
 *   보장할 수 없다.
 * 둘 다 `visualViewport`는 키보드가 차지한 만큼 줄어들므로 여기서만 판단한다.
 *
 * `BottomSheet`는 자기 안에서 같은 값을 따로 재서 시트를 밀어올린다. 열려 있는 동안 시트가
 * 화면을 덮으므로 서로 간섭하지 않아, 동작하는 그 코드는 건드리지 않았다.
 */
export function KeyboardInsetSync() {
  useEffect(() => {
    const viewport = window.visualViewport;
    if (!viewport) return;

    const root = document.documentElement;
    let frame: number | null = null;
    let current = 0;

    function apply() {
      if (!viewport) return;
      if (frame !== null) cancelAnimationFrame(frame);
      // 키보드가 오르내리는 동안 resize·scroll이 연속으로 들어온다. 프레임당 한 번만 쓴다.
      frame = requestAnimationFrame(() => {
        const next = Math.max(0, window.innerHeight - viewport.height - viewport.offsetTop);
        if (next === current) return;
        current = next;
        root.style.setProperty("--keyboard-inset", `${next}px`);
      });
    }

    apply();
    viewport.addEventListener("resize", apply);
    viewport.addEventListener("scroll", apply);
    // 계산에 `window.innerHeight`가 들어가므로 레이아웃 뷰포트가 바뀌는 경우도 받는다.
    // 회전이나 네이티브 셸이 웹뷰 크기를 바꿀 때처럼 visualViewport 쪽 이벤트만으로는
    // 놓칠 수 있는 변화가 있다. 값이 그대로면 아래에서 조기 반환하므로 덧붙는 비용은 없다.
    window.addEventListener("resize", apply);
    return () => {
      if (frame !== null) cancelAnimationFrame(frame);
      viewport.removeEventListener("resize", apply);
      viewport.removeEventListener("scroll", apply);
      window.removeEventListener("resize", apply);
      root.style.removeProperty("--keyboard-inset");
    };
  }, []);

  return null;
}
