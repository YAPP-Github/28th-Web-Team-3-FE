"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { trackPageView } from "@/lib/mixpanel";

export function MixpanelPageTracker() {
  const pathname = usePathname();

  useEffect(() => {
    if (!pathname) return;
    // mixpanel은 여기서 처음 로드된다. 기다리지 않는다 — 화면 전환이 분석 로드에 묶이면 안 된다.
    void trackPageView(pathname);
  }, [pathname]);

  return null;
}
