import type { MissionConfirmRequest } from "@repo/schema/mission-generation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  confirmGenerationJob,
  fetchGenerationDrafts,
  requestGenerationJob,
} from "./generation-api";
import { missionGenerationJobOptions } from "./options/mission";

/** 생성 job 요청(진행 중이면 서버가 같은 job을 반환하므로 여러 번 호출해도 안전하다). */
export function useRequestGenerationJob() {
  return useMutation({ mutationFn: requestGenerationJob });
}

/** job 상태 polling — 5초 간격으로 반복 조회하고, 종료 상태가 되면 멈춘다. */
export function useGenerationJobStatus(jobId: string | undefined) {
  return useQuery(missionGenerationJobOptions(jobId));
}

/** 완료된 job의 카테고리별 미션 초안 조회. */
export function useGenerationDrafts(jobId: string) {
  return useQuery({
    queryKey: ["mission-generation-drafts", jobId],
    queryFn: () => fetchGenerationDrafts(jobId),
  });
}

/** 초안 확정 — 성공하면 미션 목록 캐시를 무효화해 미션탭이 새 데이터를 받게 한다. */
export function useConfirmGenerationJob(jobId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: MissionConfirmRequest) => confirmGenerationJob(jobId, body),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["missions"] }),
  });
}
