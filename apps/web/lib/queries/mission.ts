import type { MissionSource } from "@repo/schema/mission";
import {
  keepPreviousData,
  mutationOptions,
  type QueryClient,
  queryOptions,
} from "@tanstack/react-query";
import {
  completeMission,
  createManualMission,
  deleteMission,
  fetchMissionHistories,
  fetchMissionProgress,
  fetchMissions,
  type MissionListParams,
} from "@/api/mission";

/** 미션 목록 캐시 키. 밖에서는 `missionsOptions().queryKey`로 꺼낸다. */
const MISSIONS_QUERY_KEY = ["missions"] as const;

interface MissionHistoryPeriod {
  month: number;
  year: number;
}

/** 현재 주 미션 달성 현황. */
export function missionProgressOptions() {
  return queryOptions({
    queryKey: [...MISSIONS_QUERY_KEY, "progress"],
    queryFn: fetchMissionProgress,
  });
}

/** 선택한 달의 주차별 미션 완료 내역. */
export function missionHistoriesOptions({ month, year }: MissionHistoryPeriod) {
  return queryOptions({
    queryKey: [...MISSIONS_QUERY_KEY, "histories", year, month],
    queryFn: () => fetchMissionHistories({ month, year }),
  });
}

/** 내 미션 조회. 필터가 바뀔 때는 직전 결과를 유지해 목록 깜빡임을 막는다. */
export function missionsOptions(params: MissionListParams = {}) {
  const filtered = params.status != null || params.category != null;

  return queryOptions({
    queryKey: filtered
      ? [...MISSIONS_QUERY_KEY, "filtered", params.status ?? null, params.category ?? null]
      : MISSIONS_QUERY_KEY,
    queryFn: () => fetchMissions(params),
    placeholderData: filtered ? keepPreviousData : undefined,
  });
}

/** 직접 입력 미션을 만든 뒤 미션 목록을 갱신한다. */
export function createManualMissionOptions(queryClient: QueryClient) {
  return mutationOptions({
    mutationFn: (body: Parameters<typeof createManualMission>[0]) => createManualMission(body),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: MISSIONS_QUERY_KEY }),
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

/** 미션 삭제 후 목록을 갱신한다. */
export function deleteMissionOptions(queryClient: QueryClient) {
  return mutationOptions({
    mutationFn: ({ source, missionId }: { source: MissionSource; missionId: string }) =>
      deleteMission(source, missionId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: MISSIONS_QUERY_KEY }),
  });
}
