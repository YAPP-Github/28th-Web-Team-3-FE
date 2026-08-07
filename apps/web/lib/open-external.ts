import { bridge, isNativeApp } from "@repo/bridge";
import * as Sentry from "@sentry/nextjs";

/**
 * WebView 밖에서 URL을 연다 — 정책 공식 페이지, 카카오 오픈채팅, `mailto:` 등.
 *
 * 네이티브 셸 안에서는 `window.open`·`target="_blank"`가 통하지 않아 브릿지로 위임하고,
 * 일반 브라우저에서는 새 탭으로 연다. 세 화면이 각자 같은 분기를 복사해 두고 있었다.
 *
 * 실패해도 화면은 그대로 두되(사용자가 할 수 있는 게 없다) 조용히 넘기지는 않는다.
 * 여기서 보고하지 않으면 "눌러도 안 열려요" 제보에 재현 정보가 하나도 남지 않는다.
 */
export function openExternalLink(url: string): void {
  if (isNativeApp()) {
    // 웹 브릿지는 throwOnError:true라 전송 실패(타임아웃·구버전 앱에 메서드 미등록) 시
    // reject된다. 잡지 않으면 unhandled rejection이 된다.
    bridge
      .openExternal(url)
      .then((opened) => {
        // 브릿지는 닿았지만 OS가 열지 못한 경우다 — 허용되지 않는 스킴이거나 처리할 앱이 없다.
        if (!opened) reportFailure(url, new Error("native declined to open url"));
      })
      .catch((error: unknown) => reportFailure(url, error));
    return;
  }
  // mailto를 새 탭으로 열면 메일 앱이 뜬 뒤 빈 탭이 남는다 — 현재 탭에서 넘긴다.
  if (url.startsWith("mailto:")) {
    window.location.href = url;
    return;
  }
  window.open(url, "_blank", "noopener,noreferrer");
}

function reportFailure(url: string, error: unknown) {
  // URL은 정책 링크·문의 창구라 개인정보가 아니다. 어느 링크가 막히는지 알아야 고칠 수 있다.
  Sentry.captureException(error, { tags: { feature: "open-external" }, extra: { url } });
}
