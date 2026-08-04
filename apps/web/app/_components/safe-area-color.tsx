"use client";

import { bridge, isNativeApp } from "@repo/bridge";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { getSafeAreaBandTokens } from "@/lib/safe-area-bands";

/** CSS 변수 이름을 실제 색으로 바꾼다. 정의를 못 찾으면 빈 문자열이다. */
function readColorToken(token: string): string {
  return getComputedStyle(document.documentElement).getPropertyValue(token).trim();
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
    const top = readColorToken(tokens.top);
    const bottom = readColorToken(tokens.bottom);
    // 변수를 못 읽으면 네이티브가 어차피 형식 검사에서 걸러낸다. 부르지 않고 직전 색을 남긴다.
    if (!top || !bottom) return;

    // 웹 브릿지는 throwOnError:true라 실패 시 reject된다 — 삼켜서 unhandled rejection을 막는다.
    // 구버전 셸에는 이 메서드가 없어 여기로 떨어진다. 색만 못 바꿀 뿐 화면은 그대로 뜬다.
    bridge.setSafeAreaColor(top, bottom).catch(() => {});
  }, [pathname]);

  return null;
}
