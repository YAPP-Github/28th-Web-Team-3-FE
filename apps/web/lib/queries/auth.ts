import { mutationOptions, queryOptions } from "@tanstack/react-query";
import { getCurrentUser, withdrawGuest } from "@/api/auth";

/** 현재 사용자 캐시 키. 밖에서는 `currentUserOptions().queryKey`로 꺼낸다. */
const CURRENT_USER_QUERY_KEY = ["auth", "me"] as const;

/** 현재 인증된 사용자와 온보딩 완료 여부 조회. */
export function currentUserOptions() {
  return queryOptions({
    queryKey: CURRENT_USER_QUERY_KEY,
    queryFn: getCurrentUser,
  });
}

/** 게스트 계정과 사용자 귀속 데이터를 영구 삭제한다. */
export function withdrawGuestOptions() {
  return mutationOptions({ mutationFn: withdrawGuest });
}
