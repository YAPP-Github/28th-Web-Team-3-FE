import {
  type PolicyCategory,
  type PolicyDetail,
  type PolicySummary,
  policyDetailSchema,
  policyListSchema,
} from "@repo/schema/policy";
import { http } from "@/api/client";

/**
 * 혜택(정책) API — 백엔드 OpenAPI(`/api/policies`) 연동. 공유 클라이언트를 쓰므로
 * Authorization 헤더·401 재발급은 클라이언트가 담당한다.
 * baseUrl(`NEXT_PUBLIC_API_URL`)에 `/api`가 포함되므로 경로는 리소스명만 쓴다.
 */

interface PolicyListParams {
  /** 4분류 필터. null이면 전체를 받는다. */
  category: PolicyCategory | null;
  /** 0-based 페이지 번호. */
  page: number;
  size: number;
}

/** GET /api/policies — 혜택 목록(페이지 단위). 전체 개수는 응답에 없다. */
export function fetchPolicies({
  category,
  page,
  size,
}: PolicyListParams): Promise<readonly PolicySummary[]> {
  return http.get("policies", {
    // 값이 빈 category를 보내면 서버가 "빈 문자열 분류"로 걸러 아무것도 오지 않는다.
    searchParams: { ...(category ? { category } : {}), page, size },
    response: policyListSchema,
  });
}

/** GET /api/policies/{id} — 신청 링크(`applyUrl`)가 목록에 없어 카드를 열 때 조회한다. */
export function fetchPolicyDetail(policyId: number): Promise<PolicyDetail> {
  return http.get(`policies/${policyId}`, { response: policyDetailSchema });
}

/** POST /api/policies/{id}/bookmark — 저장. 이미 저장돼 있어도 204다(멱등). */
export function bookmarkPolicy(policyId: number): Promise<void> {
  return http.post(`policies/${policyId}/bookmark`);
}

/** DELETE /api/policies/{id}/bookmark — 저장 취소. */
export function unbookmarkPolicy(policyId: number): Promise<void> {
  return http.delete(`policies/${policyId}/bookmark`);
}
