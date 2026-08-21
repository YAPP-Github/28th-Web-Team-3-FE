import { z } from "zod";

/** GET /api/tips 응답 항목. */
export const tipSummarySchema = z.object({
  id: z.number().int(),
  title: z.string(),
  category: z.string().nullish(),
  bookmarked: z.boolean(),
});
export type TipSummary = z.infer<typeof tipSummarySchema>;

export const tipListSchema = z.array(tipSummarySchema);
