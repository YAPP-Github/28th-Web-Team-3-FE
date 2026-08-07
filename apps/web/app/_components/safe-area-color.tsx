"use client";

import { bridge, isNativeApp } from "@repo/bridge";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { FALLBACK_BAND_COLOR, getSafeAreaBandTokens, isHexColor } from "@/lib/safe-area-bands";

/**
 * CSS 변수 이름을 16진수 색으로 바꾼다.
 *
 * Tailwind v4는 실제로 쓰인 theme 변수만 `:root`에 내보내므로, 히어로가 시맨틱 토큰으로
 * 바뀌면 원시 변수가 출력에서 빠질 수 있다. 그때 호출을 건너뛰면 직전 화면 색이 밴드에 그대로
 * 남으므로(혜택 → 미션 이동 시 파란 띠) 기본색으로 떨어뜨린다. 16진수가 아닌 팔레트 토큰
 * (`--color-dim-light` 등)도 네이티브가 어차피 거부하므로 여기서 함께 걸러낸다.
 */
function resolveBandColor(style: CSSStyleDeclaration, token: string): string {
  const value = style.getPropertyValue(token).trim();
  return isHexColor(value) ? value : FALLBACK_BAND_COLOR;
}

/**
 * 화면이 바뀔 때 네이티브 셸에 safe-area 밴드 색을 알린다. 상·하 인셋은 네이티브가 그리므로
 * (`apps/native/App.tsx`의 `SafeAreaBands`) 웹 CSS로는 칠할 수 없다.
 *
 * 네이티브 셸 밖(일반 브라우저)에서는 아무것도 하지 않는다 — 그쪽엔 밴드 자체가 없다.
 */
export function SafeAreaColor() {
  const pathname = usePathname();

  useEffect(() => {
    if (!pathname || !isNativeApp()) return;

    const tokens = getSafeAreaBandTokens(pathname);
    // 두 토큰을 한 번 읽은 스타일에서 뽑는다 — getComputedStyle은 호출마다 스타일을 다시 푼다.
    const style = getComputedStyle(document.documentElement);
    const top = resolveBandColor(style, tokens.top);
    const bottom = resolveBandColor(style, tokens.bottom);

    // 웹 브릿지는 throwOnError:true라 실패 시 reject된다 — 삼켜서 unhandled rejection을 막는다.
    //
    // 외부 링크(`lib/open-external.ts`)와 달리 여기서는 Sentry에 보고하지 않는다. 이 메서드가
    // 없는 구버전 셸에서는 화면을 옮길 때마다 실패하므로 보고하면 같은 이벤트만 쌓이고,
    // 실패해도 밴드 색만 그대로일 뿐 사용자가 할 수 있는 일도 잃지 않는다.
    bridge.setSafeAreaColor(top, bottom).catch(() => {});
  }, [pathname]);

  return null;
}
