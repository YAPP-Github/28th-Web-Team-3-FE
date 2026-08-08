import {
  type GoalStatus,
  type GoalUpdateRequest,
  goalStatusSchema,
  goalUpdateRequestSchema,
  type SavingRequest,
  savingRequestSchema,
} from "@repo/schema/goal";
import { http } from "@/api/client";

/**
 * 목표 API — 백엔드 OpenAPI(`/api/goal`) 연동. 공유 클라이언트를 쓰므로
 * Authorization 헤더·401 재발급은 클라이언트가 담당한다(여기선 관여하지 않는다).
 * baseUrl(`NEXT_PUBLIC_API_URL`)에 `/api`가 포함되므로 경로는 리소스명만 쓴다.
 */

/** GET /api/goal — 목표 현황 조회. */
export function fetchGoalStatus(): Promise<GoalStatus> {
  return http.get("goal", { response: goalStatusSchema });
}

/** PUT /api/goal/savings — 현재 저축액 입력. 전송 전 계약 검증. */
export function updateSavings(body: SavingRequest): Promise<void> {
  return http.put("goal/savings", { body, request: savingRequestSchema });
}

/** PATCH /api/goal — 목표 금액/기간 수정. 전송과 응답 계약을 검증한다. */
export function updateGoal(body: GoalUpdateRequest): Promise<GoalStatus> {
  return http.patch("goal", {
    body,
    request: goalUpdateRequestSchema,
    response: goalStatusSchema,
  });
}
