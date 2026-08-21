import { type TipSummary, tipListSchema } from "@repo/schema/tip";
import { http } from "@/api/client";

/** GET /api/tips — 편집된 절약 팁과 현재 게스트의 저장 여부를 함께 조회한다. */
export function fetchTips(): Promise<readonly TipSummary[]> {
  return http.get("tips", {
    // 현재 앱의 정적 절약 팁 전체를 대응시키기 위해 기본 페이지 크기(20)보다 넉넉히 요청한다.
    searchParams: { page: 0, size: 100 },
    response: tipListSchema,
  });
}

/** POST /api/tips/{id}/bookmark — 팁 저장. 이미 저장돼 있어도 204다(멱등). */
export function bookmarkTip(tipId: number): Promise<void> {
  return http.post(`tips/${tipId}/bookmark`);
}

/** DELETE /api/tips/{id}/bookmark — 팁 저장 취소. */
export function unbookmarkTip(tipId: number): Promise<void> {
  return http.delete(`tips/${tipId}/bookmark`);
}
