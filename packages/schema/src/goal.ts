import { z } from "zod";

/**
 * 목표(모으기) API 계약 — 백엔드 OpenAPI(`/api/goal`) 기준.
 * 금액 단위는 모두 "만원"(정수)이다.
 */

/** 이번 달 목표 현황. */
export const thisMonthSchema = z.object({
  targetManwon: z.number().int(),
  savedManwon: z.number().int(),
  progressPercent: z.number().int(),
  dday: z.number().int(),
});

/** GET /api/goal 응답. */
export const goalStatusSchema = z.object({
  targetAmountManwon: z.number().int(),
  totalSavedManwon: z.number().int(),
  progressPercent: z.number().int(),
  usageMonths: z.number().int(),
  deadlineDDay: z.number().int(),
  thisMonth: thisMonthSchema,
});

export type ThisMonth = z.infer<typeof thisMonthSchema>;
export type GoalStatus = z.infer<typeof goalStatusSchema>;

/** PUT /api/goal/savings 요청 — 현재 저축액 입력. */
export const savingRequestSchema = z.object({
  savedAmountManwon: z.number().int().min(0),
});
export type SavingRequest = z.infer<typeof savingRequestSchema>;

/** PATCH /api/goal 요청 — 목표 금액/기간 수정. 둘 다 선택(null이면 미변경). */
export const goalUpdateRequestSchema = z.object({
  targetAmountManwon: z.number().int().positive().nullable(),
  periodMonths: z.number().int().positive().nullable(),
});
export type GoalUpdateRequest = z.infer<typeof goalUpdateRequestSchema>;
