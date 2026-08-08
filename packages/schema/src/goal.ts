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
  dDay: z.number().int(),
});

/** GET /api/goal 응답. */
export const goalStatusSchema = z.object({
  targetAmountManwon: z.number().int(),
  periodMonths: z.number().int(),
  totalSavedManwon: z.number().int(),
  progressPercent: z.number().int(),
  usageMonths: z.number().int(),
  deadlineDDay: z.number().int(),
  thisMonth: thisMonthSchema,
});

export type ThisMonth = z.infer<typeof thisMonthSchema>;
export type GoalStatus = z.infer<typeof goalStatusSchema>;

/** 요청 값 허용 범위 — 백엔드 검증과 동일하게 맞춘다(초과하면 400). */
export const MAX_SAVED_AMOUNT_MANWON = 100_000;
export const MIN_GOAL_TARGET_MANWON = 1;
export const MAX_GOAL_TARGET_MANWON = 1_000_000;
export const MIN_GOAL_PERIOD_MONTHS = 3;
export const MAX_GOAL_PERIOD_MONTHS = 36;

/** PUT /api/goal/savings 요청 — 현재 저축액 입력. */
export const savingRequestSchema = z.object({
  savedAmountManwon: z.number().int().min(0).max(MAX_SAVED_AMOUNT_MANWON),
});
export type SavingRequest = z.infer<typeof savingRequestSchema>;

/** PATCH /api/goal 요청 — 목표 금액/기간 수정. 둘 다 선택(null이면 미변경). */
export const goalUpdateRequestSchema = z.object({
  targetAmountManwon: z
    .number()
    .int()
    .min(MIN_GOAL_TARGET_MANWON)
    .max(MAX_GOAL_TARGET_MANWON)
    .nullable(),
  periodMonths: z.number().int().min(MIN_GOAL_PERIOD_MONTHS).max(MAX_GOAL_PERIOD_MONTHS).nullable(),
});
export type GoalUpdateRequest = z.infer<typeof goalUpdateRequestSchema>;
