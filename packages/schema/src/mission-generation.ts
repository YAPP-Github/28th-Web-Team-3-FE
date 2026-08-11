import { z } from "zod";
import {
  activeMissionCategorySchema,
  MISSION_ITEM_CATEGORIES,
  missionCategorySchema,
  missionItemSchema,
} from "./mission";

/**
 * 미션 초안 생성(비동기 job) API 계약 — 백엔드 OpenAPI(`/api/missions/generation-jobs`) 기준.
 */

export const missionGenerationJobStatusSchema = z.enum([
  "PENDING",
  "RUNNING",
  "SUCCEEDED",
  "FAILED",
]);
export type MissionGenerationJobStatus = z.infer<typeof missionGenerationJobStatusSchema>;

export const missionGenerationJobSchema = z.object({
  jobId: z.string(),
  status: missionGenerationJobStatusSchema,
  failureCode: z.string().nullable(),
  generationSource: z.string().nullable(),
  draftsAvailable: z.boolean(),
  expiresAt: z.string().nullable(),
  confirmed: z.boolean(),
  pollingIntervalMillis: z.number().int(),
});
export type MissionGenerationJob = z.infer<typeof missionGenerationJobSchema>;

export const MIN_MISSION_BASELINE_FREQUENCY = 1;
export const MAX_MISSION_BASELINE_FREQUENCY = 10;
export const MIN_MISSION_BASELINE_AMOUNT_WON = 1;
export const MAX_MISSION_BASELINE_AMOUNT_WON = 2_000_000;

export const missionBaselineFrequencySchema = z
  .number()
  .int()
  .min(MIN_MISSION_BASELINE_FREQUENCY)
  .max(MAX_MISSION_BASELINE_FREQUENCY);

export const missionBaselineAmountWonSchema = z
  .number()
  .int()
  .min(MIN_MISSION_BASELINE_AMOUNT_WON)
  .max(MAX_MISSION_BASELINE_AMOUNT_WON);

export const missionGenerationCreateRequestSchema = z
  .object({
    category: activeMissionCategorySchema,
    item: missionItemSchema,
    baselineFrequency: missionBaselineFrequencySchema,
    baselineAmountWon: missionBaselineAmountWonSchema,
  })
  .superRefine((request, context) => {
    if (MISSION_ITEM_CATEGORIES[request.item] !== request.category) {
      context.addIssue({
        code: "custom",
        message: "미션 항목이 카테고리와 일치하지 않습니다.",
        path: ["item"],
      });
    }
  });
export type MissionGenerationCreateRequest = z.infer<typeof missionGenerationCreateRequestSchema>;

export const missionDraftSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  actionCode: z.string(),
  metricType: z.string(),
  targetCount: z.number().int(),
  targetUnit: z.string(),
  estimatedSavingsWon: z.number().int(),
  savingsEstimateVersion: z.string(),
  savingsLabel: z.string(),
});
export type MissionDraft = z.infer<typeof missionDraftSchema>;

export const missionCategoryDraftsSchema = z.object({
  category: missionCategorySchema,
  drafts: z.array(missionDraftSchema),
});
export type MissionCategoryDrafts = z.infer<typeof missionCategoryDraftsSchema>;

/** GET /api/missions/generation-jobs/{jobId}/drafts 응답. */
export const missionDraftsResponseSchema = z.object({
  jobId: z.string(),
  categories: z.array(missionCategoryDraftsSchema),
});
export type MissionDraftsResponse = z.infer<typeof missionDraftsResponseSchema>;

/** POST /api/missions/generation-jobs/{jobId}/confirm 요청 — 1개 이상, 중복 없이. */
export const missionConfirmRequestSchema = z.object({
  selectedDraftIds: z.array(z.string()).min(1),
});
export type MissionConfirmRequest = z.infer<typeof missionConfirmRequestSchema>;

export const missionConfirmResponseSchema = z.object({
  jobId: z.string(),
  missions: z.array(
    z.object({
      id: z.string(),
      category: missionCategorySchema,
      title: z.string(),
      description: z.string(),
      actionCode: z.string(),
      metricType: z.string(),
      targetCount: z.number().int(),
      targetUnit: z.string(),
      estimatedSavingsWon: z.number().int(),
      savingsEstimateVersion: z.string(),
      savingsLabel: z.string(),
      status: z.string(),
    }),
  ),
});
export type MissionConfirmResponse = z.infer<typeof missionConfirmResponseSchema>;
