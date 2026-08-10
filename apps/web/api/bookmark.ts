import { type SavedContent, savedContentListSchema } from "@repo/schema/bookmark";
import { http } from "@/api/client";

/**
 * 저장됨(북마크) API — 백엔드 OpenAPI(`/api/bookmarks`) 연동.
 * 혜택과 팁이 한 목록으로 오므로 `type`으로 좁혀서 쓴다.
 */

/** GET /api/bookmarks?type=POLICY — 저장한 혜택만 최신순으로. */
export function fetchSavedPolicies(): Promise<readonly SavedContent[]> {
  return http.get("bookmarks", {
    searchParams: { type: "POLICY" },
    response: savedContentListSchema,
  });
}
