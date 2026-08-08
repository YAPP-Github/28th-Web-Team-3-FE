import { type CurrentUser, currentUserSchema } from "@repo/schema/auth";
import { http } from "@/api/client";

/** GET /api/auth/me — 현재 사용자와 온보딩 완료 여부 조회. */
export function getCurrentUser(): Promise<CurrentUser> {
  return http.get("auth/me", { response: currentUserSchema });
}

/** DELETE /api/auth/guest — 게스트 계정과 사용자 귀속 데이터 영구 삭제. */
export function withdrawGuest(): Promise<void> {
  return http.delete("auth/guest");
}
