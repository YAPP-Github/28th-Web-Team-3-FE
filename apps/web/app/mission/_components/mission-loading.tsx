"use client";

import type { MissionGenerationJob } from "@repo/schema/mission-generation";
import { Button } from "@repo/ui";
import MissionLoadingCoin from "@repo/ui/svg/mission-loading-coin.svg";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { buildMissionCreationResultHref } from "@/app/mission/constants/mission-creation";
import {
  getPollingIntervalMillis,
  startMissionGenerationWorkerPolling,
  supportsMissionGenerationWorker,
} from "@/app/mission/new/utils/mission-generation-polling";
import { generationJobStatusOptions } from "@/lib/queries/mission-generation";
import styles from "./mission-loading.module.css";

/**
 * AI 미션 초안 생성 job이 끝날 때까지 polling한다. jobId는 설문 제출 단계에서 만들어
 * URL로 넘겨받는다 — 생성 화면에서 mutation을 쏘지 않으므로 새로고침해도 새 job이 생기지 않고,
 * StrictMode에서 mutation 결과가 유실되던 문제도 없다. 반복 폴링은 refetchInterval에 맡긴다.
 */
export function MissionLoading({ jobId }: { jobId: string }) {
  const router = useRouter();
  const [workerMode, setWorkerMode] = useState<"starting" | "active" | "fallback">(() =>
    supportsMissionGenerationWorker() ? "starting" : "fallback",
  );
  const [workerJob, setWorkerJob] = useState<MissionGenerationJob>();
  const [workerMessageVersion, setWorkerMessageVersion] = useState(0);
  const { data: pageJob, isError } = useQuery({
    ...generationJobStatusOptions(jobId),
    enabled: workerMode === "fallback",
  });
  const job = workerJob ?? pageJob;

  useEffect(() => {
    if (!supportsMissionGenerationWorker()) return;
    let mounted = true;
    let unsubscribe: (() => void) | null = null;
    const fallbackTimer = setTimeout(
      () => setWorkerMode("fallback"),
      getPollingIntervalMillis() * 2,
    );
    void startMissionGenerationWorkerPolling({
      jobId,
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
  }, [jobId]);

  useEffect(() => {
    if (workerMode !== "active") return;
    const fallbackTimer = setTimeout(
      () => setWorkerMode("fallback"),
      getPollingIntervalMillis() * 2,
    );
    return () => clearTimeout(fallbackTimer);
  }, [workerMessageVersion, workerMode]);

  useEffect(() => {
    if (job?.status === "SUCCEEDED" && job.draftsAvailable) {
      router.replace(buildMissionCreationResultHref(jobId));
    }
  }, [job, jobId, router]);

  // 5초마다 폴링하므로 일시적인 조회 실패로 "생성 실패"를 띄우면 안 된다 — 다음 폴링이
  // 성공할 수 있다. 서버가 FAILED를 주거나, 첫 조회부터 실패해 상태를 아예 못 받은 경우만 실패다.
  const failed = job?.status === "FAILED" || (isError && !job);

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col items-center justify-center bg-gray-0 px-5 text-center">
      {failed ? (
        <div className="flex flex-col items-center gap-4">
          <p className="text-body-b1-500 text-gray-700">
            미션 생성에 실패했어요.
            <br />
            잠시 후 다시 시도해 주세요.
          </p>
          <Button onClick={() => router.push("/mission")}>미션 홈으로</Button>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-3" role="status">
          <div className="flex size-20 items-center justify-center [perspective:400px]">
            <div className={styles.coin}>
              <MissionLoadingCoin aria-hidden="true" className={styles.coinFace} />
              <MissionLoadingCoin aria-hidden="true" className={styles.coinBack} />
            </div>
          </div>
          <p className="text-body-b1-500 text-gray-700">
            답변을 바탕으로
            <br />
            맞춤 미션을 만들고 있어요.
          </p>
        </div>
      )}
    </main>
  );
}
