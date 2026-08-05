/**
 * safe-area 밴드 색 저장소. 인셋의 주인이 네이티브 셸이라(`App.tsx`) 웹 CSS로는 이 영역을
 * 칠할 수 없는데, 화면마다 히어로 배경이 달라 밴드도 따라가야 한다. 웹이 브릿지로 색을
 * 통보하면 여기 담고 셸이 `useSyncExternalStore`로 구독한다.
 *
 * 브릿지 계약(`AppBridgeMethods`)은 async 함수만 담는 레코드라 상태를 브릿지 store에 넣지
 * 않고 이 모듈에 둔다.
 */

export interface SafeAreaColors {
  top: string;
  bottom: string;
}

/** 웹이 색을 통보하기 전까지 쓰는 값. 웹 `--color-gray-0`과 같다. */
export const DEFAULT_SAFE_AREA_COLORS: SafeAreaColors = { top: "#ffffff", bottom: "#ffffff" };

const HEX_COLOR = /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;

let colors: SafeAreaColors = DEFAULT_SAFE_AREA_COLORS;
const listeners = new Set<() => void>();

/**
 * 밴드 색을 바꾼다. 웹이 넘긴 값이 그대로 RN `backgroundColor`에 들어가므로 16진수 색만
 * 받아들이고, 형식이 어긋나면 직전 색을 유지한다.
 */
export function setColors(top: string, bottom: string): void {
  if (!HEX_COLOR.test(top) || !HEX_COLOR.test(bottom)) {
    // 웹도 같은 검사를 하므로 여기 걸리면 웹의 폴백이 새고 있다는 뜻이다. 조용히 넘기면
    // 밴드 색만 안 바뀌어 원인을 못 찾는다.
    if (__DEV__) console.warn(`[safe-area] 16진수 색이 아니다: top=${top} bottom=${bottom}`);
    return;
  }
  // 같은 값이면 스냅샷 참조를 유지한다 — 바꾸면 useSyncExternalStore가 매번 리렌더한다.
  if (top === colors.top && bottom === colors.bottom) return;
  colors = { top, bottom };
  for (const listener of listeners) listener();
}

/**
 * 밴드를 기본 흰색으로 되돌린다. 웹이 아니라 셸이 화면을 덮을 때(로드 실패 오버레이) 쓴다 —
 * 오버레이는 흰색인데 밴드에는 웹이 마지막으로 통보한 색이 남아 있어, 그대로 두면 흰 화면
 * 위아래로 직전 화면의 색 띠만 남는다. 네트워크가 끊긴 상태면 웹이 다시 통보할 수도 없다.
 */
export function resetColors(): void {
  setColors(DEFAULT_SAFE_AREA_COLORS.top, DEFAULT_SAFE_AREA_COLORS.bottom);
}

export function subscribeSafeAreaColors(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function getSafeAreaColors(): SafeAreaColors {
  return colors;
}
