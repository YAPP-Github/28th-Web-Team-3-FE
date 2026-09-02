import type { SavingTipCategory } from "@repo/schema/tip";
import { keepPreviousData, mutationOptions, queryOptions } from "@tanstack/react-query";
import { bookmarkSavingTip, fetchAllSavingTips, unbookmarkSavingTip } from "@/api/tip";

/** 응답이 이 수보다 짧아질 때까지 다음 페이지를 이어 받는다. */
const SAVING_TIP_PAGE_SIZE = 100;

/** 절약 팁 목록. 저장 목록은 전체를 받고 `bookmarked`로 좁힌다. */
export function savingTipsOptions(category: SavingTipCategory | null) {
  return queryOptions({
    queryKey: ["tips", category] as const,
    queryFn: () => fetchAllSavingTips(category, SAVING_TIP_PAGE_SIZE),
    // 칩을 바꾸면 category가 달라져 캐시 키가 통째로 바뀐다. 직전 결과를 유지하지 않으면
    // 그 사이 목록이 로딩 문구로 갈아엎였다가 새로 채워져 깜빡인다.
    placeholderData: keepPreviousData,
  });
}

/** 절약 팁 저장 상태 전환. `bookmarked`는 누르기 직전 상태다. */
export function toggleSavingTipBookmarkOptions() {
  return mutationOptions({
    mutationFn: ({ bookmarked, tipId }: { bookmarked: boolean; tipId: number }) =>
      bookmarked ? unbookmarkSavingTip(tipId) : bookmarkSavingTip(tipId),
  });
}
