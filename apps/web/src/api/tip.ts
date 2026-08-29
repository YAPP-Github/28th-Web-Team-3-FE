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

/**
 * 끝을 응답 길이로만 판단하면 서버가 `page`를 무시하고 늘 꽉 찬 페이지를 주는 순간 멈추지
 * 않는다 — 요청이 무한히 나가고 화면이 멎는다. 상한을 둬 어떤 응답에도 반드시 끝나게 한다.
 */
export const SAVING_TIP_MAX_PAGES = 20;

/**
 * 페이지 정보가 없는 목록 응답을 끝까지 모은다.
 *
 * 저장 탭은 어떤 카테고리에 저장된 팁도 빠짐없이 보여야 하므로, 한 페이지 크기에 기대지 않는다.
 */
export async function fetchAllSavingTips(
  category: SavingTipCategory | null,
  size: number,
): Promise<readonly SavingTipSummary[]> {
  const tips: SavingTipSummary[] = [];
  for (let page = 0; page < SAVING_TIP_MAX_PAGES; page += 1) {
    const nextPage = await fetchSavingTips({ category, page, size });
    tips.push(...nextPage);
    if (nextPage.length < size) break;
  }
  return tips;
}

/** POST /api/tips/{id}/bookmark — 절약 팁을 저장한다. */
export function bookmarkSavingTip(tipId: number): Promise<void> {
  return http.post(`tips/${tipId}/bookmark`);
}

/** DELETE /api/tips/{id}/bookmark — 절약 팁 저장을 취소한다. */
export function unbookmarkSavingTip(tipId: number): Promise<void> {
  return http.delete(`tips/${tipId}/bookmark`);
}
