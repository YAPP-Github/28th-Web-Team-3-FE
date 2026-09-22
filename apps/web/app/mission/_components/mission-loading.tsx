"use client";

import { Button } from "@repo/ui";
import MissionLoadingCoin from "@repo/ui/svg/mission-loading-coin.svg";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { buildMissionCreationResultHref } from "@/app/mission/constants/mission-creation";
import { clearPendingMissionGeneration } from "@/app/mission/new/utils/pending-mission-generation";
import { missionGenerationFailureMessage } from "@/lib/mission-generation";
import { generationJobStatusOptions } from "@/lib/queries/mission-generation";
import styles from "./mission-loading.module.css";

/**
 * AI 미션 초안 생성 job이 끝날 때까지 polling한다. jobId는 설문 제출 단계에서 만들어
 * URL로 넘겨받는다 — 생성 화면에서 mutation을 쏘지 않으므로 새로고침해도 새 job이 생기지 않고,
 * StrictMode에서 mutation 결과가 유실되던 문제도 없다. 반복 폴링은 refetchInterval에 맡긴다.
 */
export function MissionLoading({ jobId }: { jobId: string }) {
  const router = useRouter();
  const { data: job, error, isFetching, refetch } = useQuery(generationJobStatusOptions(jobId));
  const failureMessage = missionGenerationFailureMessage(job, error);

  useEffect(() => {
    if (failureMessage) void clearPendingMissionGeneration(jobId);
  }, [failureMessage, jobId]);

  useEffect(() => {
    const refetchOnAppActive = () => {
      if (!failureMessage) void refetch();
    };
    window.addEventListener("akkimo:app-active", refetchOnAppActive);
    return () => window.removeEventListener("akkimo:app-active", refetchOnAppActive);
  }, [failureMessage, refetch]);

  useEffect(() => {
    if (!error && job?.status === "SUCCEEDED" && job.draftsAvailable) {
      router.replace(buildMissionCreationResultHref(jobId));
    }
  }, [error, job, jobId, router]);

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col items-center justify-center bg-gray-0 px-5 text-center">
      {failureMessage || error ? (
        <div className="flex flex-col items-center gap-4">
          <p role="status" className="text-body-b1-500 text-gray-700">
            {failureMessage ?? "진행 상태를 확인하지 못했어요."}
          </p>
          {failureMessage ? (
            <Button
              onClick={async () => {
                await clearPendingMissionGeneration(jobId);
                router.replace("/mission/new");
              }}
            >
              다시 생성하기
            </Button>
          ) : (
            <Button disabled={isFetching} onClick={() => void refetch()}>
              다시 확인하기
            </Button>
          )}
        </div>
      ) : (
        <div className="flex flex-col items-center gap-3" role="status">
          <div className="flex size-20 items-center justify-center [perspective:400px]">
            <div className={styles.coin}>
              <MissionLoadingCoin aria-hidden="true" className={styles.coinFace} />
              <MissionLoadingCoin aria-hidden="true" className={styles.coinBack} />
            </div>
          </div>
          <p className="text-balance break-keep text-body-b1-500 text-gray-700">
            답변을 바탕으로 맞춤 미션을 만들고 있어요.
          </p>
          <p className="max-w-[280px] text-balance break-keep text-body-b2-500 text-gray-600">
            시간이 걸릴 수 있어요. 다른 화면을 보고 있어도 완료되면 알려드릴게요.
          </p>
        </div>
      )}
      <Button variant="secondary" className="mt-4" onClick={() => router.push("/mission")}>
        다른 화면 둘러보기
      </Button>
    </main>
  );
}
