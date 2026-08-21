"use client";

import type { PendingMissionGeneration } from "@repo/bridge";
import { bridge, isNativeApp } from "@repo/bridge";
import type { MissionGenerationJob } from "@repo/schema/mission-generation";
import { Button, Dialog } from "@repo/ui";
import { useQuery } from "@tanstack/react-query";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  buildMissionCreationResultHref,
  buildMissionLoadingHref,
} from "@/app/mission/constants/mission-creation";
import { generationJobStatusOptions } from "@/lib/queries/mission-generation";

function isMissionGenerationComplete(job: MissionGenerationJob | undefined) {
  return job?.status === "SUCCEEDED" && job.draftsAvailable;
}

/**
 * 네이티브에 남아 있는 생성 job을 앱 재진입 시 복구한다.
 *
 * 생성 중에 다른 화면으로 이동한 경우에는 결과가 준비됐을 때만 모달을 띄운다.
 * 사용자가 다시 추천받기를 눌러 `/mission/new`으로 진입한 경우에만 기존 job의 로딩 화면으로 보낸다.
 */
export function PendingMissionGenerationRecovery() {
  const pathname = usePathname();
  const router = useRouter();
  const [pendingJob, setPendingJob] = useState<PendingMissionGeneration>();
  const [resultJobId, setResultJobId] = useState<string>();
  const completedJobId = useRef<string | undefined>(undefined);
  const dismissedJobId = useRef<string | undefined>(undefined);
  const pendingJobId = pendingJob?.jobId;
  const isRecommendationStartPage = pathname === "/mission/new";
  const isMissionCreationPage =
    isRecommendationStartPage ||
    pathname.startsWith("/mission/new/loading") ||
    pathname.startsWith("/mission/new/result");
  if (pathname.startsWith("/mission/new/result") && pendingJobId) {
    // effect가 pending job을 비우기 전에 사용자가 미션 화면으로 돌아가도, 완료한 같은 job을
    // 백그라운드 작업으로 다시 해석해 모달을 띄우지 않게 렌더 시점에 먼저 표시한다.
    completedJobId.current = pendingJobId;
  }
  const shouldPollInBackground =
    Boolean(pendingJob) && !isMissionCreationPage && completedJobId.current !== pendingJobId;
  const { data: job, refetch } = useQuery({
    ...generationJobStatusOptions(pendingJobId),
    enabled: shouldPollInBackground,
  });

  useEffect(() => {
    if (!isNativeApp()) return;

    let cancelled = false;
    const recoverPendingJob = () => {
      void bridge
        .getPendingMissionGeneration()
        .then((job) => {
          if (cancelled) return;
          if (!job) {
            setPendingJob(undefined);
            return;
          }
          if (job.expiresAt && Date.parse(job.expiresAt) <= Date.now()) {
            setPendingJob(undefined);
            void bridge.clearPendingMissionGeneration();
            return;
          }
          if (completedJobId.current === job.jobId) {
            setPendingJob(undefined);
            return;
          }
          setPendingJob(job);
          if (pathname === "/mission/new") {
            router.replace(buildMissionLoadingHref(job.jobId));
          }
        })
        // 웹 배포가 먼저 나간 경우, 구 버전 네이티브에는 해당 브릿지 메서드가 없다.
        .catch(() => {
          if (!cancelled) setPendingJob(undefined);
        });
    };

    recoverPendingJob();
    const handleVisibilityChange = () => {
      if (document.visibilityState !== "visible") return;
      recoverPendingJob();
      if (shouldPollInBackground) void refetch();
    };
    const handleAppActive = () => {
      recoverPendingJob();
      if (shouldPollInBackground) void refetch();
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("akkimo:app-active", handleAppActive);

    return () => {
      cancelled = true;
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("akkimo:app-active", handleAppActive);
    };
  }, [pathname, refetch, router, shouldPollInBackground]);

  useEffect(() => {
    if (!pathname.startsWith("/mission/new/result")) return;
    dismissedJobId.current = pendingJobId;
    setPendingJob(undefined);
    setResultJobId(undefined);
  }, [pathname, pendingJobId]);

  useEffect(() => {
    if (!shouldPollInBackground || !pendingJob || !isMissionGenerationComplete(job)) return;
    if (dismissedJobId.current === pendingJob.jobId) return;
    setResultJobId(pendingJob.jobId);
  }, [job, pendingJob, shouldPollInBackground]);

  const closeResultDialog = () => {
    if (resultJobId) dismissedJobId.current = resultJobId;
    setResultJobId(undefined);
  };

  return (
    <Dialog
      open={Boolean(resultJobId)}
      title="미션이 생성됐어요."
      onOpenChange={(open) => {
        if (!open) closeResultDialog();
      }}
    >
      <p className="text-center text-body-b2-500 text-gray-700">확인하러 갈까요?</p>
      <div className="grid w-full grid-cols-2 gap-2.5">
        <Button
          className="h-[52px] text-body-b1-700 text-gray-800"
          size="cta"
          variant="secondary"
          onClick={closeResultDialog}
        >
          아니요
        </Button>
        <Button
          className="h-[52px] text-body-b1-700"
          size="cta"
          onClick={() => {
            if (resultJobId) router.replace(buildMissionCreationResultHref(resultJobId));
          }}
        >
          네
        </Button>
      </div>
    </Dialog>
  );
}
