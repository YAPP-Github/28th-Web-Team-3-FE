import type { GoalUpdateRequest, SavingRequest } from "@repo/schema/goal";
import { mutationOptions, type QueryClient, queryOptions } from "@tanstack/react-query";
import { fetchGoalStatus, updateGoal, updateSavings } from "@/api/goal";

/** 목표 현황 캐시 키. 밖에서는 `goalStatusOptions().queryKey`로 꺼낸다. */
const GOAL_QUERY_KEY = ["goal"] as const;

/** 목표 현황 조회. */
export function goalStatusOptions() {
  return queryOptions({
    queryKey: GOAL_QUERY_KEY,
    queryFn: fetchGoalStatus,
  });
}

/** 현재 저축액 입력 후 목표 현황을 갱신한다. */
export function updateSavingsOptions(queryClient: QueryClient) {
  return mutationOptions({
    mutationFn: (body: SavingRequest) => updateSavings(body),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: GOAL_QUERY_KEY }),
  });
}

/** 목표 금액/기간 수정 후 목표 현황을 갱신한다. */
export function updateGoalOptions(queryClient: QueryClient) {
  return mutationOptions({
    mutationFn: (body: GoalUpdateRequest) => updateGoal(body),
    onMutate: () => queryClient.cancelQueries({ queryKey: goalStatusOptions().queryKey }),
    onSuccess: (goal) => queryClient.setQueryData(goalStatusOptions().queryKey, goal),
  });
}
