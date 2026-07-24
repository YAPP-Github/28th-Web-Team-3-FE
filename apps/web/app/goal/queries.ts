import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchGoalStatus, updateGoal, updateSavings } from "./api";

const GOAL_QUERY_KEY = ["goal"] as const;

/** 목표 현황 조회. */
export function useGoalStatus() {
  return useQuery({
    queryKey: GOAL_QUERY_KEY,
    queryFn: fetchGoalStatus,
  });
}

/** 현재 저축액 입력 후 목표 현황을 갱신한다. */
export function useUpdateSavings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateSavings,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: GOAL_QUERY_KEY }),
  });
}

/** 목표 금액/기간 수정 후 목표 현황을 갱신한다. */
export function useUpdateGoal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateGoal,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: GOAL_QUERY_KEY }),
  });
}
