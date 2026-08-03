import { queryOptions } from "@tanstack/react-query";
import { getCurrentUser } from "@/api/auth";

/** 현재 인증된 사용자와 온보딩 완료 여부 조회. */
export function currentUserOptions() {
  return queryOptions({
    queryKey: currentUserOptions.key(),
    queryFn: getCurrentUser,
  });
}

export namespace currentUserOptions {
  export function key() {
    return ["auth", "me"] as const;
  }
}
