import { z } from "zod";

/**
 * 저장됨(북마크) API 계약 — 백엔드 OpenAPI(`/api/bookmarks`) 기준.
 * 혜택(POLICY)과 팁(TIP)을 한 목록으로 돌려주고 `type` 쿼리로 좁힌다.
 */

export const savedContentTypeSchema = z.enum(["POLICY", "TIP"]);
export type SavedContentType = z.infer<typeof savedContentTypeSchema>;

/**
 * GET /api/bookmarks 응답 항목. 저장 목록이라 `bookmarked`는 따로 오지 않는다(전부 저장됨).
 * 혜택 목록(`PolicySummary`)과 달리 `largeCategory`도 없다.
 */
export const savedContentSchema = z.object({
  contentType: savedContentTypeSchema,
  id: z.number().int(),
  title: z.string(),
  category: z.string().nullable(),
  description: z.string().nullable(),
});
export type SavedContent = z.infer<typeof savedContentSchema>;

export const savedContentListSchema = z.array(savedContentSchema);
