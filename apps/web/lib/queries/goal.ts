import type { GoalUpdateRequest, SavingRequest } from "@repo/schema/goal";
import { mutationOptions, type QueryClient, queryOptions } from "@tanstack/react-query";
import { fetchGoalStatus, updateGoal, updateSavings } from "@/api/goal";
import { reportGoalStatusError } from "@/lib/report-goal-status-error";

/** 목표 현황 캐시 키. 밖에서는 `goalStatusOptions().queryKey`로 꺼낸다. */
const GOAL_QUERY_KEY = ["goal"] as const;

/** 목표 현황 조회. */
export function goalStatusOptions() {
  return queryOptions({
    queryKey: GOAL_QUERY_KEY,
    queryFn: async () => {
      try {
        return await fetchGoalStatus();
      } catch (error) {
        reportGoalStatusError(error);
        throw error;
      }
    },
  });
}

/**
 * 저장 뒤 목표 현황 재조회.
 *
 * 재조회 실패를 mutation 실패로 올리지 않는다 — 저장은 이미 서버에 반영됐는데 "저장하지
 * 못했어요"가 뜨면 사용자는 같은 값을 다시 저장하며 빠져나오지 못한다. 재조회 실패는
 * 조회 쪽 오류로 남아 화면이 "최신 정보를 불러오지 못했다"로 안내한다(`GoalDetail`).
 *
 * 그래도 await은 유지한다 — 갱신이 끝난 뒤 시트가 닫혀야 방금 넣은 값이 바로 보인다.
 */
function refetchGoalStatus(queryClient: QueryClient) {
  return queryClient.invalidateQueries({
    queryKey: goalStatusOptions().queryKey,
    refetchType: "all",
  });
}

/** 현재 저축액 입력 후 목표 현황을 갱신한다. */
export function updateSavingsOptions(queryClient: QueryClient) {
  return mutationOptions({
    mutationFn: (body: SavingRequest) => updateSavings(body),
    onMutate: () => queryClient.cancelQueries({ queryKey: goalStatusOptions().queryKey }),
    onSuccess: () => refetchGoalStatus(queryClient),
  });
}

/** 목표 금액/기간 수정 후 목표 현황을 갱신한다. */
export function updateGoalOptions(queryClient: QueryClient) {
  return mutationOptions({
    mutationFn: (body: GoalUpdateRequest) => updateGoal(body),
    onMutate: () => queryClient.cancelQueries({ queryKey: goalStatusOptions().queryKey }),
    onSuccess: () => refetchGoalStatus(queryClient),
  });
}
