import {
  type SavingTipCategory,
  type SavingTipSummary,
  savingTipListSchema,
} from "@repo/schema/tip";
import { http } from "@/api/client";

interface SavingTipListParams {
  category: SavingTipCategory | null;
  page: number;
  size: number;
}

/** GET /api/tips — 절약 팁 목록을 카테고리·페이지 단위로 조회한다. */
export function fetchSavingTips({
  category,
  page,
  size,
}: SavingTipListParams): Promise<readonly SavingTipSummary[]> {
  return http.get("tips", {
    searchParams: { ...(category ? { category } : {}), page, size },
    response: savingTipListSchema,
  });
}

/** POST /api/tips/{id}/bookmark — 절약 팁을 저장한다. */
export function bookmarkSavingTip(tipId: number): Promise<void> {
  return http.post(`tips/${tipId}/bookmark`);
}

/** DELETE /api/tips/{id}/bookmark — 절약 팁 저장을 취소한다. */
export function unbookmarkSavingTip(tipId: number): Promise<void> {
  return http.delete(`tips/${tipId}/bookmark`);
}
