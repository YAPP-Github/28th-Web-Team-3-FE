"use client";

import mixpanel from "mixpanel-browser";

const MIXPANEL_TOKEN = process.env.NEXT_PUBLIC_MIXPANEL_TOKEN;

let initialized = false;

export function initMixpanel() {
  if (initialized) return true;
  if (!MIXPANEL_TOKEN) return false;

  mixpanel.init(MIXPANEL_TOKEN, {
    autocapture: false,
    debug: process.env.NODE_ENV === "development",
    ignore_dnt: false,
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
