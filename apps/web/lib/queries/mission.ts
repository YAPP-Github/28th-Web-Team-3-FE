import type { MissionSource } from "@repo/schema/mission";
import { mutationOptions, type QueryClient, queryOptions } from "@tanstack/react-query";
import { completeMission, deleteRecommendedMission, fetchMissions } from "@/api/mission";

/** 미션 목록 캐시 키. 밖에서는 `missionsOptions().queryKey`로 꺼낸다. */
const MISSIONS_QUERY_KEY = ["missions"] as const;

/** 내 미션 전체 조회. */
export function missionsOptions() {
  return queryOptions({
    queryKey: MISSIONS_QUERY_KEY,
    queryFn: fetchMissions,
  });
}

/** 미션 완료 처리 후 목록을 갱신한다. */
export function completeMissionOptions(queryClient: QueryClient) {
  return mutationOptions({
    mutationFn: ({ source, missionId }: { source: MissionSource; missionId: string }) =>
      completeMission(source, missionId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: MISSIONS_QUERY_KEY }),
  });
}

/** 추천 미션 삭제 후 목록을 갱신한다. */
export function deleteRecommendedMissionOptions(queryClient: QueryClient) {
  return mutationOptions({
    mutationFn: ({ missionId }: { missionId: string }) => deleteRecommendedMission(missionId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: MISSIONS_QUERY_KEY }),
  });
}
