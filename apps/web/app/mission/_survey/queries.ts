import type { MissionCategory } from "@repo/schema/mission";
import { useMutation, useQuery } from "@tanstack/react-query";
import { fetchSurveyQuestions, replaceSurvey } from "./api";

/** 선택한 카테고리들의 설문 문항 조회. */
export function useSurveyQuestions(categories: readonly MissionCategory[]) {
  return useQuery({
    queryKey: ["mission-survey-questions", [...categories].sort()],
    queryFn: () => fetchSurveyQuestions(categories),
    enabled: categories.length > 0,
  });
}

/** 설문 저장·교체. */
export function useReplaceSurvey() {
  return useMutation({ mutationFn: replaceSurvey });
}
