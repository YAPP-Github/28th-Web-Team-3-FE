import { mutationOptions, queryOptions } from "@tanstack/react-query";
import { bookmarkTip, fetchTips, unbookmarkTip } from "@/api/tip";

/** 절약 팁 목록과 각 팁의 현재 저장 상태. */
export function tipsOptions() {
  return queryOptions({
    queryKey: ["tips"] as const,
    queryFn: fetchTips,
  });
}

/** 팁 저장 토글. `saved`는 누르기 직전 상태다. */
export function toggleTipBookmarkOptions() {
  return mutationOptions({
    mutationFn: ({ tipId, saved }: { tipId: number; saved: boolean }) =>
      saved ? unbookmarkTip(tipId) : bookmarkTip(tipId),
  });
}
