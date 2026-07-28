// mixpanel-browser는 window에 붙는다 — 서버 번들에 들어가면 빌드 타임에 깨뜨린다.
// "use client"는 경계 선언일 뿐 서버 사용을 막지 못하므로 client-only를 쓴다.
import "client-only";

import mixpanel from "mixpanel-browser";

const MIXPANEL_TOKEN = process.env.NEXT_PUBLIC_MIXPANEL_TOKEN;
const MIXPANEL_REPLAY_SAMPLE_PERCENT = process.env.NEXT_PUBLIC_MIXPANEL_REPLAY_SAMPLE_PERCENT;

let initialized = false;

function replaySamplePercent() {
  const parsed = Number(MIXPANEL_REPLAY_SAMPLE_PERCENT ?? 100);
  if (!Number.isFinite(parsed)) return 100;
  return Math.min(100, Math.max(0, parsed));
}

export function initMixpanel() {
  if (initialized) return true;
  if (!MIXPANEL_TOKEN) return false;

  mixpanel.init(MIXPANEL_TOKEN, {
    autocapture: false,
    debug: process.env.NODE_ENV === "development",
    ignore_dnt: false,
    record_mask_all_inputs: true,
    record_mask_all_text: true,
    record_sessions_percent: replaySamplePercent(),
  });
  initialized = true;
  return true;
}

export function trackPageView(path: string) {
  if (!initMixpanel()) return;

  mixpanel.track("Page Viewed", {
    path,
  });
}
