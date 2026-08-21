import { z } from "zod";

/** 절약 팁 API가 사용하는 미션 대분류. */
export const savingTipCategorySchema = z.enum(["식비", "생활", "취미"]);
export type SavingTipCategory = z.infer<typeof savingTipCategorySchema>;

/** GET /api/tips 응답 항목. `bookmarked`는 현재 게스트의 저장 여부다. */
export const savingTipSummarySchema = z.object({
  id: z.number().int(),
  title: z.string(),
  description: z.string().nullish(),
  category: savingTipCategorySchema.nullish(),
  subcategory: z.string().nullish(),
  sourceUrl: z.string().url().nullish(),
  bookmarked: z.boolean(),
});
export type SavingTipSummary = z.infer<typeof savingTipSummarySchema>;

/** GET /api/tips 응답. 전체 개수 없이 배열만 온다(page·size 쿼리). */
export const savingTipListSchema = z.array(savingTipSummarySchema);
