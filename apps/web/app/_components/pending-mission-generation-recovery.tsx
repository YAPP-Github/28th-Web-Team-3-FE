"use client";

import { bridge, isNativeApp } from "@repo/bridge";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { buildMissionLoadingHref } from "@/app/mission/constants/mission-creation";

/** 네이티브에 남아 있는 생성 job을 앱 재진입 시 로딩 화면으로 복구한다. */
export function PendingMissionGenerationRecovery() {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (
      !isNativeApp() ||
      pathname.startsWith("/mission/new/loading") ||
      pathname.startsWith("/mission/new/result")
    ) {
      return;
    }
    void bridge.getPendingMissionGeneration().then((job) => {
      if (!job) return;
      if (job.expiresAt && Date.parse(job.expiresAt) <= Date.now()) {
        void bridge.clearPendingMissionGeneration();
        return;
      }
      router.replace(buildMissionLoadingHref(job.jobId));
    });
  }, [pathname, router]);

  return null;
}
