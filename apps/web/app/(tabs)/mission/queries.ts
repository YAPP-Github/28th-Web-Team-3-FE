import type { MissionSource } from "@repo/schema/mission";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { completeMission, deleteRecommendedMission, fetchMissions } from "./api";

/** 미션 목록 캐시 키. 생성 job 확정 등 다른 기능도 이걸 무효화하므로 export한다. */
export const MISSIONS_QUERY_KEY = ["missions"] as const;

/** 내 미션 전체 조회. */
export function useMissions() {
  return useQuery({
    queryKey: MISSIONS_QUERY_KEY,
    queryFn: fetchMissions,
  });
}

/** 미션 완료 처리 후 목록을 갱신한다. */
export function useCompleteMission() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ source, missionId }: { source: MissionSource; missionId: string }) =>
      completeMission(source, missionId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: MISSIONS_QUERY_KEY }),
  });
}

/** 추천 미션 삭제 후 목록을 갱신한다. */
export function useDeleteRecommendedMission() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ missionId }: { missionId: string }) => deleteRecommendedMission(missionId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: MISSIONS_QUERY_KEY }),
  });
}
