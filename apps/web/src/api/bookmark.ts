import { type SavedContent, savedContentListSchema } from "@repo/schema/bookmark";
import { http } from "@/api/client";

/**
 * 저장됨(북마크) API — 백엔드 OpenAPI(`/api/bookmarks`) 연동.
 * 혜택과 팁이 한 목록으로 오므로 `type`으로 좁혀서 쓴다.
 */

/**
 * GET /api/bookmarks?type=POLICY — 저장한 혜택만 최신순으로.
 *
 * 받은 뒤 한 번 더 거른다 — 팁이 섞여 들어오면 혜택 카드로 그려지고, 별을 누를 때 그 id가
 * 정책 북마크 경로로 나간다. 서버 필터 하나에만 기대기엔 대가가 크다.
 */
export async function fetchSavedPolicies(): Promise<readonly SavedContent[]> {
  const saved = await http.get("bookmarks", {
    searchParams: { type: "POLICY" },
    response: savedContentListSchema,
  });
  return saved.filter((item) => item.contentType === "POLICY");
}
