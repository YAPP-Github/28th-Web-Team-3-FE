import { queryOptions } from "@tanstack/react-query";
import { fetchGenerationJobStatus } from "../_generation/api";

export const MISSION_GENERATION_POLLING_INTERVAL_MS = 5000;

/**
 * 생성 job 상태 조회 옵션. 결과 화면으로 넘어갈 수 있는 상태가 되기 전까지
 * react-query의 `refetchInterval`로 5초마다 재조회하고, 종료되면 `false`를 반환해 멈춘다.
 * - FAILED: 실패로 종료.
 * - SUCCEEDED + draftsAvailable: 초안 준비 완료 → 폴링 종료(호출부가 결과 화면으로 이동).
 *   SUCCEEDED지만 draftsAvailable가 아직 false면 준비될 때까지 계속 폴링한다.
 */
export function missionGenerationJobOptions(jobId: string | undefined) {
  return queryOptions({
    queryKey: ["mission-generation-job", jobId],
    queryFn: () => fetchGenerationJobStatus(jobId as string),
    enabled: Boolean(jobId),
    refetchInterval: (query) => {
      const job = query.state.data;
      if (job?.status === "FAILED") return false;
      if (job?.status === "SUCCEEDED" && job.draftsAvailable) return false;
      return MISSION_GENERATION_POLLING_INTERVAL_MS;
    },
  });
}
