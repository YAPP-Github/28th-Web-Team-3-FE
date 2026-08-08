import { z } from "zod";

/**
 * 미션 API 계약 — 백엔드 OpenAPI(`/api/missions`) 기준.
 * `MissionLifecycleResponse`에는 자유 텍스트 설명이 없다 — `savingsLabel`이 그 역할을 한다.
 */

export const missionCategorySchema = z.enum(["MEAL", "TRANSPORT", "HOBBY", "LIVING"]);
export type MissionCategory = z.infer<typeof missionCategorySchema>;

export const missionSourceSchema = z.enum(["RECOMMENDED", "MANUAL"]);
export type MissionSource = z.infer<typeof missionSourceSchema>;

export const missionStatusSchema = z.enum(["ACTIVE", "COMPLETED", "INCOMPLETE"]);
export type MissionStatus = z.infer<typeof missionStatusSchema>;

const missionBaseSchema = z.object({
  id: z.string(),
  category: missionCategorySchema,
  title: z.string(),
  status: missionStatusSchema,
  weekEndsAt: z.string(),
});

/** GET /api/missions 응답의 미션 하나. 수동 미션에는 절약 추정 필드가 없다. */
export const missionSchema = z.discriminatedUnion("source", [
  missionBaseSchema.extend({
    source: z.literal("RECOMMENDED"),
    targetCount: z.number().int(),
    targetUnit: z.string(),
    estimatedSavingsWon: z.number().int(),
    savingsEstimateVersion: z.string(),
    savingsLabel: z.string(),
  }),
  missionBaseSchema.extend({
    source: z.literal("MANUAL"),
    targetCount: z.null().optional(),
    targetUnit: z.null().optional(),
    estimatedSavingsWon: z.null().optional(),
    savingsEstimateVersion: z.null().optional(),
    savingsLabel: z.null().optional(),
  }),
]);
export type Mission = z.infer<typeof missionSchema>;

/** GET /api/missions 응답. */
export const missionsResponseSchema = z.object({
  missions: z.array(missionSchema),
});
export type MissionsResponse = z.infer<typeof missionsResponseSchema>;
