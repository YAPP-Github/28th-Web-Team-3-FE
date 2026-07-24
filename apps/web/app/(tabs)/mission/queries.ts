import type { MissionSource } from "@repo/schema/mission";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { completeMission, fetchMissions } from "./api";

const MISSIONS_QUERY_KEY = ["missions"] as const;

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
