"use client";

import { Button } from "@repo/ui";
import MissionLoadingCoin from "@repo/ui/svg/mission-loading-coin.svg";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { buildMissionCreationResultHref } from "@/app/mission/constants/mission-creation";
import { generationJobStatusOptions } from "@/lib/queries/mission-generation";
import styles from "./mission-loading.module.css";

const MIN_LOADING_DURATION_MS = 8_000;
const MAX_LOADING_DURATION_MS = 12_000;

function getLoadingDuration() {
  return (
    MIN_LOADING_DURATION_MS +
    Math.floor(Math.random() * (MAX_LOADING_DURATION_MS - MIN_LOADING_DURATION_MS + 1))
  );
}

/**
 * AI 미션 초안 생성 job이 끝날 때까지 polling한다. jobId는 설문 제출 단계에서 만들어
 * URL로 넘겨받는다 — 생성 화면에서 mutation을 쏘지 않으므로 새로고침해도 새 job이 생기지 않고,
 * StrictMode에서 mutation 결과가 유실되던 문제도 없다. 반복 폴링은 refetchInterval에 맡긴다.
 */
export function MissionLoading({ jobId }: { jobId: string }) {
  const router = useRouter();
  const [loadingDuration] = useState(getLoadingDuration);
  const [hasMinimumLoadingTimeElapsed, setHasMinimumLoadingTimeElapsed] = useState(false);
  const { data: job, isError, refetch } = useQuery(generationJobStatusOptions(jobId));

  useEffect(() => {
    const timeoutId = window.setTimeout(
      () => setHasMinimumLoadingTimeElapsed(true),
      loadingDuration,
    );
    return () => window.clearTimeout(timeoutId);
  }, [loadingDuration]);

  useEffect(() => {
    const refetchOnAppActive = () => {
      void refetch();
    };
    window.addEventListener("akkimo:app-active", refetchOnAppActive);
    return () => window.removeEventListener("akkimo:app-active", refetchOnAppActive);
  }, [refetch]);

  useEffect(() => {
    if (hasMinimumLoadingTimeElapsed && job?.status === "SUCCEEDED" && job.draftsAvailable) {
      router.replace(buildMissionCreationResultHref(jobId));
    }
  }, [hasMinimumLoadingTimeElapsed, job, jobId, router]);

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
