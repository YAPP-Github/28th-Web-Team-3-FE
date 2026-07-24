"use client";

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
