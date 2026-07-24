import type { MissionCategory } from "@repo/schema/mission";
import {
  type MissionSurveyPutRequest,
  type MissionSurveyQuestionsResponse,
  type MissionSurveyResponse,
  missionSurveyPutRequestSchema,
  missionSurveyQuestionsResponseSchema,
  missionSurveyResponseSchema,
} from "@repo/schema/mission-survey";
import { api } from "@/lib/api";

/**
 * 미션 생성 사전 설문 API — 백엔드 OpenAPI(`/api/missions/surveys`) 연동. 공유 `api`(ky) 클라이언트를
 * 쓰므로 Authorization 헤더·401 재발급은 클라이언트가 담당한다(여기선 관여하지 않는다).
 */

/** GET /api/missions/surveys/questions — 선택한 카테고리들의 설문 문항 조회. */
export async function fetchSurveyQuestions(
  categories: readonly MissionCategory[],
): Promise<MissionSurveyQuestionsResponse> {
  const searchParams = new URLSearchParams();
  for (const category of categories) searchParams.append("categories", category);
  return missionSurveyQuestionsResponseSchema.parse(
    await api.get("missions/surveys/questions", { searchParams }).json(),
  );
}

/** PUT /api/missions/surveys — 설문 저장·교체. 전송 전 계약 검증. */
export async function replaceSurvey(body: MissionSurveyPutRequest): Promise<MissionSurveyResponse> {
  return missionSurveyResponseSchema.parse(
    await api.put("missions/surveys", { json: missionSurveyPutRequestSchema.parse(body) }).json(),
  );
}
