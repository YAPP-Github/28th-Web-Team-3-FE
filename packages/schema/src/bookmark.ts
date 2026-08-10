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
 *
 * `id`는 북마크 행이 아니라 콘텐츠(정책·팁) id다 — `contentType`과 짝으로 와야 어느 리소스의
 * id인지 정해지기 때문이다. 저장 취소(`DELETE /api/policies/{id}/bookmark`)와 상세 조회가 이
 * 값을 그대로 쓰므로, 백엔드가 북마크 행 id로 바꾸면 다른 정책이 지워진다.
 */
export const savedContentSchema = z.object({
  contentType: savedContentTypeSchema,
  id: z.number().int(),
  title: z.string(),
  category: z.string().nullish(),
  description: z.string().nullish(),
});
export type SavedContent = z.infer<typeof savedContentSchema>;

export const savedContentListSchema = z.array(savedContentSchema);
