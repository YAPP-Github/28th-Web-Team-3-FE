import { queryOptions } from "@tanstack/react-query";
import { fetchSavedPolicies } from "@/api/bookmark";

/** 저장한 혜택 목록. 밖에서는 `savedPoliciesOptions().queryKey`로 키를 꺼낸다. */
export function savedPoliciesOptions() {
  return queryOptions({
    queryKey: ["bookmarks", "POLICY"] as const,
    queryFn: fetchSavedPolicies,
  });
}
