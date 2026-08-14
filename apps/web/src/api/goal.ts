import {
  type GoalStatus,
  type GoalSummary,
  type GoalUpdateRequest,
  goalStatusSchema,
  goalSummarySchema,
  goalUpdateRequestSchema,
  type SavingRequest,
  savingRequestSchema,
} from "@repo/schema/goal";
import { http } from "@/api/client";

/**
 * 목표 API — 조회는 `/api/v2/goal`, 수정은 v1(`/api/goal`)이다. 공유 클라이언트를 쓰므로
 * Authorization 헤더·401 재발급은 클라이언트가 담당한다(여기선 관여하지 않는다).
 * baseUrl(`NEXT_PUBLIC_API_URL`)에 `/api`가 포함되므로 경로는 리소스명만 쓴다.
 */

/** GET /api/v2/goal — 월별 저축 현황을 포함한 목표 상세 조회. */
export function fetchGoalStatus(): Promise<GoalStatus> {
  return http.get("v2/goal", { response: goalStatusSchema });
}

/** PUT /api/goal/savings — 이번 달 저축액 입력 후 갱신된 목표 현황 반환. */
export function updateSavings(body: SavingRequest): Promise<GoalSummary> {
  return http.put("goal/savings", {
    body,
    request: savingRequestSchema,
    response: goalSummarySchema,
  });
}

/** PATCH /api/goal — 목표 금액/기간 수정. 전송과 응답 계약을 검증한다. */
export function updateGoal(body: GoalUpdateRequest): Promise<GoalSummary> {
  return http.patch("goal", {
    body,
    request: goalUpdateRequestSchema,
    response: goalSummarySchema,
  });
}
