import type {
  MissionConfirmRequest,
  MissionGenerationCreateRequest,
} from "@repo/schema/mission-generation";
import { mutationOptions, type QueryClient, queryOptions } from "@tanstack/react-query";
import {
  confirmGenerationJob,
  fetchGenerationDrafts,
  fetchGenerationJobStatus,
  fetchMissionCatalog,
  requestGenerationJob,
} from "@/api/mission-generation";
import { missionsOptions } from "@/lib/queries/mission";

const MISSION_GENERATION_POLLING_INTERVAL_MS = 5000;

/** 새 미션 정책의 카테고리·소비 항목 카탈로그. */
export function missionCatalogOptions() {
  return queryOptions({
    queryKey: ["mission-catalog"],
    queryFn: fetchMissionCatalog,
    staleTime: Number.POSITIVE_INFINITY,
  });
}

/** 생성 job 요청(진행 중이면 서버가 같은 job을 반환하므로 여러 번 호출해도 안전하다). */
export function requestGenerationJobOptions() {
  return mutationOptions({
    mutationFn: (body: MissionGenerationCreateRequest) => requestGenerationJob(body),
  });
}

/**
 * 생성 job 상태 조회 옵션. 결과 화면으로 넘어갈 수 있는 상태가 되기 전까지
 * react-query의 `refetchInterval`로 5초마다 재조회하고, 종료되면 `false`를 반환해 멈춘다.
 * - FAILED: 실패로 종료.
 * - SUCCEEDED + draftsAvailable: 초안 준비 완료 → 폴링 종료(호출부가 결과 화면으로 이동).
 *   SUCCEEDED지만 draftsAvailable가 아직 false면 준비될 때까지 계속 폴링한다.
 */
export function generationJobStatusOptions(jobId: string | undefined) {
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

/** 완료된 job의 카테고리별 미션 초안 조회. */
export function generationDraftsOptions(jobId: string) {
  return queryOptions({
    queryKey: ["mission-generation-drafts", jobId],
    queryFn: () => fetchGenerationDrafts(jobId),
  });
}

/** 초안 확정 — 성공하면 미션 목록 캐시를 무효화해 미션탭이 새 데이터를 받게 한다. */
export function confirmGenerationJobOptions(jobId: string, queryClient: QueryClient) {
  return mutationOptions({
    mutationFn: (body: MissionConfirmRequest) => confirmGenerationJob(jobId, body),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: missionsOptions().queryKey }),
  });
}
