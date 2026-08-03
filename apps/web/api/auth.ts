import { type CurrentUser, currentUserSchema } from "@repo/schema/auth";
import { http } from "@/api/client";

/** GET /api/auth/me — 현재 사용자와 온보딩 완료 여부 조회. */
export function getCurrentUser(): Promise<CurrentUser> {
  return http.get("auth/me", { response: currentUserSchema });
}
