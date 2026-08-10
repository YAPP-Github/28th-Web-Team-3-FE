import { z } from "zod";

/**
 * 혜택(정책) API 계약 — 백엔드 OpenAPI(`/api/policies`) 기준.
 * 화면 용어는 "혜택"이고 백엔드 리소스명은 policy다.
 *
 * 원본이 공공 데이터라 분류·설명·링크가 비어 있는 항목이 있다. 서버가 그대로 흘려보내므로
 * 필수로 좁히면 목록 전체가 파싱 단계에서 죽는다 — 비어 있을 수 있는 값은 nullable로 둔다.
 */

/** 목록 필터의 4분류. 서버가 이 한글 문자열을 그대로 `category` 쿼리로 받는다. */
export const POLICY_CATEGORIES = ["금융", "주거", "복지", "교육"] as const;
export type PolicyCategory = (typeof POLICY_CATEGORIES)[number];

/** GET /api/policies 응답 항목. `bookmarked`는 현재 게스트의 저장 여부다. */
export const policySummarySchema = z.object({
  id: z.number().int(),
  title: z.string(),
  category: z.string().nullable(),
  largeCategory: z.string().nullable(),
  description: z.string().nullable(),
  bookmarked: z.boolean(),
});
export type PolicySummary = z.infer<typeof policySummarySchema>;

/** GET /api/policies 응답. 전체 개수 없이 배열만 온다(페이지네이션은 page·size 쿼리). */
export const policyListSchema = z.array(policySummarySchema);

/** GET /api/policies/{id} 응답. 목록에 없는 신청 링크(`applyUrl`)가 여기 있다. */
export const policyDetailSchema = z.object({
  id: z.number().int(),
  title: z.string(),
  description: z.string().nullable(),
  supportContent: z.string().nullable(),
  category: z.string().nullable(),
  largeCategory: z.string().nullable(),
  mediumCategory: z.string().nullable(),
  supervisingOrg: z.string().nullable(),
  applyUrl: z.string().nullable(),
  applyPeriodText: z.string().nullable(),
  applyMethod: z.string().nullable(),
  submitDocuments: z.string().nullable(),
  targetMinAge: z.number().int().nullable(),
  targetMaxAge: z.number().int().nullable(),
  earnCondition: z.string().nullable(),
  additionalQualification: z.string().nullable(),
  bookmarked: z.boolean(),
});
export type PolicyDetail = z.infer<typeof policyDetailSchema>;
