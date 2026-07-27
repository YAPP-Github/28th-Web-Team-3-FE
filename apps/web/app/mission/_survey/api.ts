import type { MissionCategory } from "@repo/schema/mission";
import {
  type MissionSurveyPutRequest,
  type MissionSurveyQuestionsResponse,
  type MissionSurveyResponse,
  missionSurveyPutRequestSchema,
  missionSurveyQuestionsResponseSchema,
  missionSurveyResponseSchema,
} from "@repo/schema/mission-survey";
import { http } from "@/lib/api";

/**
 * 미션 생성 사전 설문 API — 백엔드 OpenAPI(`/api/missions/surveys`) 연동. 공유 클라이언트를
 * 쓰므로 Authorization 헤더·401 재발급은 클라이언트가 담당한다(여기선 관여하지 않는다).
 */

/** GET /api/missions/surveys/questions — 선택한 카테고리들의 설문 문항 조회. */
export function fetchSurveyQuestions(
  categories: readonly MissionCategory[],
): Promise<MissionSurveyQuestionsResponse> {
  const searchParams = new URLSearchParams();
  for (const category of categories) searchParams.append("categories", category);
  return http.get("missions/surveys/questions", {
    searchParams,
    response: missionSurveyQuestionsResponseSchema,
  });
}

/** PUT /api/missions/surveys — 설문 저장·교체. 전송 전 계약 검증. */
export function replaceSurvey(body: MissionSurveyPutRequest): Promise<MissionSurveyResponse> {
  return http.put("missions/surveys", {
    body,
    request: missionSurveyPutRequestSchema,
    response: missionSurveyResponseSchema,
  });
}
