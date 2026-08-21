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
import {
  getPollingIntervalMillis,
  startMissionGenerationWorkerPolling,
  supportsMissionGenerationWorker,
} from "@/app/mission/new/utils/mission-generation-polling";
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
  const [workerJob, setWorkerJob] = useState<MissionGenerationJob>();
  const [workerMode, setWorkerMode] = useState<"starting" | "active" | "fallback">("starting");
  const [workerMessageVersion, setWorkerMessageVersion] = useState(0);
  const [resultJobId, setResultJobId] = useState<string>();
  const dismissedJobId = useRef<string | undefined>(undefined);
  const recoveredPendingJobId = useRef<string | undefined>(undefined);
  const pendingJobId = pendingJob?.jobId;
  const isRecommendationStartPage = pathname === "/mission/new";
  const isMissionCreationPage =
    isRecommendationStartPage ||
    pathname.startsWith("/mission/new/loading") ||
    pathname.startsWith("/mission/new/result");
  const shouldPollInBackground = Boolean(pendingJob) && !isMissionCreationPage;
  const { data: pageJob } = useQuery({
    ...generationJobStatusOptions(pendingJobId),
    enabled: shouldPollInBackground && workerMode === "fallback",
  });
  const job = workerJob ?? pageJob;

  useEffect(() => {
    if (!isNativeApp()) return;

    let cancelled = false;
    const recoverPendingJob = () => {
      void bridge.getPendingMissionGeneration().then((job) => {
        if (cancelled) return;
        if (!job) {
          recoveredPendingJobId.current = undefined;
          setPendingJob(undefined);
          return;
        }
        if (job.expiresAt && Date.parse(job.expiresAt) <= Date.now()) {
          recoveredPendingJobId.current = undefined;
          setPendingJob(undefined);
          void bridge.clearPendingMissionGeneration();
          return;
        }
        if (recoveredPendingJobId.current !== job.jobId) {
          recoveredPendingJobId.current = job.jobId;
          setWorkerMode(supportsMissionGenerationWorker() ? "starting" : "fallback");
        }
        setPendingJob(job);
        if (pathname === "/mission/new") {
          router.replace(buildMissionLoadingHref(job.jobId));
        }
      });
    };

    recoverPendingJob();
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") recoverPendingJob();
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      cancelled = true;
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [pathname, router]);

  useEffect(() => {
    if (!shouldPollInBackground || !pendingJobId) return;

    setWorkerJob(undefined);
    if (!supportsMissionGenerationWorker()) {
      setWorkerMode("fallback");
      return;
    }

    let mounted = true;
    let unsubscribe: (() => void) | null = null;
    setWorkerMode("starting");
    const fallbackTimer = setTimeout(
      () => setWorkerMode("fallback"),
      getPollingIntervalMillis() * 2,
    );
    void startMissionGenerationWorkerPolling({
      jobId: pendingJobId,
      onMessage: (message) => {
        if (!mounted) return;
        if (message.type === "status") {
          setWorkerMessageVersion((version) => version + 1);
          setWorkerJob(message.job);
        }
        if (message.type === "error" && message.reason === "unauthorized") {
          setWorkerMode("fallback");
        }
      },
    })
      .then((resolvedUnsubscribe) => {
        if (!mounted) {
          resolvedUnsubscribe?.();
          return;
        }
        unsubscribe = resolvedUnsubscribe;
        if (resolvedUnsubscribe) clearTimeout(fallbackTimer);
        setWorkerMode(resolvedUnsubscribe ? "active" : "fallback");
      })
      .catch(() => {
        if (mounted) setWorkerMode("fallback");
      });

    return () => {
      mounted = false;
      clearTimeout(fallbackTimer);
      unsubscribe?.();
    };
  }, [pendingJobId, shouldPollInBackground]);

  useEffect(() => {
    if (workerMode !== "active") return;
    const fallbackTimer = setTimeout(
      () => setWorkerMode("fallback"),
      getPollingIntervalMillis() * 2,
    );
    return () => clearTimeout(fallbackTimer);
  }, [workerMessageVersion, workerMode]);

  useEffect(() => {
    if (!pendingJob || !isMissionGenerationComplete(job)) return;
    if (dismissedJobId.current === pendingJob.jobId) return;
    setResultJobId(pendingJob.jobId);
  }, [job, pendingJob]);

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
