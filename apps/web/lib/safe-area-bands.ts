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

export const DEFAULT_BAND_TOKENS: SafeAreaBandTokens = {
  top: "--color-gray-0",
  bottom: "--color-gray-0",
};

/**
 * 상단 밴드가 히어로 색을 이어받는 화면에서 히어로에 붙이는 표시.
 *
 * 히어로는 sticky가 아니라 스크롤하면 화면 위로 사라진다. 그때도 밴드가 히어로 색이면
 * 아래는 흰 본문인데 위만 색이 남아 띠가 생긴다 — 없애려던 흰 띠가 색만 바뀌어 돌아온다.
 * 스크롤할 때마다 이 요소가 아직 화면 맨 위를 덮고 있는지 보고 색을 되돌린다.
 */
export const SAFE_AREA_HERO_ATTRIBUTE = "data-safe-area-hero";

const ROUTE_BAND_TOKENS: Record<string, SafeAreaBandTokens> = {
  // 미션 히어로가 bg-gray-50, 혜택 히어로가 bg-blue-50다.
  "/mission": { top: "--color-gray-50", bottom: "--color-gray-0" },
  "/benefits": { top: "--color-blue-50", bottom: "--color-gray-0" },
};

/** 경로에 해당하는 밴드 토큰. 등록되지 않은 경로는 기본값(양쪽 흰색)이다. */
export function getSafeAreaBandTokens(pathname: string): SafeAreaBandTokens {
  return ROUTE_BAND_TOKENS[pathname] ?? DEFAULT_BAND_TOKENS;
}

/** 변수를 못 읽거나 16진수가 아닐 때 쓰는 색. `--color-gray-0`과 같은 값이다. */
export const FALLBACK_BAND_COLOR = "#ffffff";

/** 네이티브가 받아들이는 형식인지. RN `backgroundColor`에 그대로 들어가므로 앵커해서 본다. */
export function isHexColor(value: string): boolean {
  return /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(value);
}
