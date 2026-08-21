import type { SavingTipCategory } from "@repo/schema/tip";
import { mutationOptions, queryOptions } from "@tanstack/react-query";
import { bookmarkSavingTip, fetchSavingTips, unbookmarkSavingTip } from "@/api/tip";

/** 서버 시드 전체를 한 번에 받는 크기. 현재 절약 팁 수보다 충분히 크다. */
export const SAVING_TIP_PAGE_SIZE = 100;

/** 절약 팁 목록. 저장 목록은 전체를 받고 `bookmarked`로 좁힌다. */
export function savingTipsOptions(category: SavingTipCategory | null) {
  return queryOptions({
    queryKey: ["tips", category] as const,
    queryFn: () => fetchSavingTips({ category, page: 0, size: SAVING_TIP_PAGE_SIZE }),
  });
}

/** 절약 팁 저장 상태 전환. `bookmarked`는 누르기 직전 상태다. */
export function toggleSavingTipBookmarkOptions() {
  return mutationOptions({
    mutationFn: ({ bookmarked, tipId }: { bookmarked: boolean; tipId: number }) =>
      bookmarked ? unbookmarkSavingTip(tipId) : bookmarkSavingTip(tipId),
  });
}
