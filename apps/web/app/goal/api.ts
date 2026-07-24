import {
  type GoalStatus,
  type GoalUpdateRequest,
  goalStatusSchema,
  type SavingRequest,
} from "@repo/schema/goal";
import { api } from "@/lib/api";

/**
 * 목표 API — 백엔드 OpenAPI(`/api/goal`) 연동. 공유 `api`(ky) 클라이언트를 쓰므로
 * Authorization 헤더·401 재발급은 클라이언트가 담당한다(여기선 관여하지 않는다).
 */

/** GET /api/goal — 목표 현황 조회. */
export async function fetchGoalStatus(): Promise<GoalStatus> {
  return goalStatusSchema.parse(await api.get("api/goal").json());
}

/** PUT /api/goal/savings — 현재 저축액 입력. */
export async function updateSavings(body: SavingRequest): Promise<void> {
  await api.put("api/goal/savings", { json: body });
}

/** PATCH /api/goal — 목표 금액/기간 수정. */
export async function updateGoal(body: GoalUpdateRequest): Promise<void> {
  await api.patch("api/goal", { json: body });
}
