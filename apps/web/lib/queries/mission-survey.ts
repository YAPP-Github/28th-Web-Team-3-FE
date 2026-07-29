import type { MissionCategory } from "@repo/schema/mission";
import { mutationOptions, queryOptions } from "@tanstack/react-query";
import { fetchSurveyQuestions, replaceSurvey } from "@/api/mission-survey";

/** 선택한 카테고리들의 설문 문항 조회. */
export function surveyQuestionsOptions(categories: readonly MissionCategory[]) {
  return queryOptions({
    queryKey: ["mission-survey-questions", [...categories].sort()],
    queryFn: () => fetchSurveyQuestions(categories),
    enabled: categories.length > 0,
  });
}

/** 설문 저장·교체. */
export function replaceSurveyOptions() {
  return mutationOptions({ mutationFn: replaceSurvey });
}
