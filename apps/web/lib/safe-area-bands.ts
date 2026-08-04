/**
 * 경로별 safe-area 밴드 색. 인셋의 주인이 네이티브 셸이라 웹 CSS로는 이 영역을 칠할 수 없고,
 * 브릿지로 색을 넘겨야 한다.
 *
 * 값은 색이 아니라 CSS 변수 이름이다 — 색 정의는 `@repo/ui`의 globals.css 한 곳에만 둔다.
 * 상단은 그 화면 맨 위 배경(히어로)을 이어받고, 하단은 바텀 네비 배경(gray-0)을 따른다.
 */
export interface SafeAreaBandTokens {
  top: string;
  bottom: string;
}

const DEFAULT_BAND_TOKENS: SafeAreaBandTokens = {
  top: "--color-gray-0",
  bottom: "--color-gray-0",
};

const ROUTE_BAND_TOKENS: Record<string, SafeAreaBandTokens> = {
  // 미션 히어로가 bg-gray-50, 혜택 히어로가 bg-blue-50다.
  "/mission": { top: "--color-gray-50", bottom: "--color-gray-0" },
  "/benefits": { top: "--color-blue-50", bottom: "--color-gray-0" },
};

/** 경로에 해당하는 밴드 토큰. 등록되지 않은 경로는 기본값(양쪽 흰색)이다. */
export function getSafeAreaBandTokens(pathname: string): SafeAreaBandTokens {
  return ROUTE_BAND_TOKENS[pathname] ?? DEFAULT_BAND_TOKENS;
}
