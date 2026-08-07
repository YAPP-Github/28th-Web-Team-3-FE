"use client";

import { bridge, isNativeApp } from "@repo/bridge";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import {
  DEFAULT_BAND_TOKENS,
  FALLBACK_BAND_COLOR,
  getSafeAreaBandTokens,
  isHexColor,
  SAFE_AREA_HERO_ATTRIBUTE,
} from "@/lib/safe-area-bands";

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
 * 히어로가 화면 위로 완전히 지나갔는지.
 *
 * 아직 못 찾았으면 지나가지 않은 것으로 본다 — 미션 탭은 데이터를 받은 뒤 히어로를 그리는데,
 * 그 사이 기본색을 보내면 히어로 색으로 맞춰 둔 로딩 화면 위에 흰 띠가 생긴다.
 */
function hasHeroScrolledPast(): boolean {
  const hero = document.querySelector(`[${SAFE_AREA_HERO_ATTRIBUTE}]`);
  return hero !== null && hero.getBoundingClientRect().bottom <= 0;
}

/**
 * 화면이 바뀔 때 네이티브 셸에 safe-area 밴드 색을 알린다. 상·하 인셋은 네이티브가 그리므로
 * (`apps/native/App.tsx`의 `SafeAreaBands`) 웹 CSS로는 칠할 수 없다.
 *
 * 히어로가 있는 화면은 스크롤도 따라간다. 히어로가 sticky가 아니라 위로 사라지면 밴드만 색이
 * 남아 띠가 생기므로, 그때는 기본색으로 되돌린다.
 *
 * 네이티브 셸 밖(일반 브라우저)에서는 아무것도 하지 않는다 — 그쪽엔 밴드 자체가 없다.
 */
export function SafeAreaColor() {
  const pathname = usePathname();

  useEffect(() => {
    if (!pathname || !isNativeApp()) return;

    // 두 토큰을 한 번 읽은 스타일에서 뽑는다 — getComputedStyle은 호출마다 스타일을 다시 푼다.
    const style = getComputedStyle(document.documentElement);
    const tokens = getSafeAreaBandTokens(pathname);
    const heroTop = resolveBandColor(style, tokens.top);
    const bottom = resolveBandColor(style, tokens.bottom);
    const scrolledTop = resolveBandColor(style, DEFAULT_BAND_TOKENS.top);

    let sent: string | undefined;
    function send(top: string) {
      // 스크롤 중 같은 값을 되풀이 보내지 않는다. 네이티브도 같은 값을 무시하지만
      // 브릿지 왕복 자체를 줄인다.
      if (top === sent) return;
      sent = top;
      // 웹 브릿지는 throwOnError:true라 실패 시 reject된다 — 삼켜서 unhandled rejection을 막는다.
      //
      // 외부 링크(`lib/open-external.ts`)와 달리 여기서는 Sentry에 보고하지 않는다. 이 메서드가
      // 없는 구버전 셸에서는 화면을 옮길 때마다 실패하므로 보고하면 같은 이벤트만 쌓이고,
      // 실패해도 밴드 색만 그대로일 뿐 사용자가 할 수 있는 일도 잃지 않는다.
      bridge.setSafeAreaColor(top, bottom).catch(() => {});
    }

    // 히어로 색과 기본색이 같은 화면은 스크롤을 봐도 바뀔 게 없다.
    if (heroTop === scrolledTop) {
      send(heroTop);
      return;
    }

    function sync() {
      send(hasHeroScrolledPast() ? scrolledTop : heroTop);
    }

    // 히어로는 데이터를 받은 뒤 그려지기도 한다(미션 탭). 스크롤할 때마다 다시 찾으므로
    // 이 시점에 아직 없어도 처음 스크롤에서 따라잡는다.
    sync();

    // 스크롤마다 재배치를 일으키지 않도록 프레임당 한 번만 잰다.
    let frame = 0;
    function onScroll() {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        sync();
      });
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [pathname]);

  return null;
}
