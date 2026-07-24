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

/** GET /api/missions 응답의 미션 하나. */
export const missionSchema = z.object({
  id: z.string(),
  source: missionSourceSchema,
  category: missionCategorySchema,
  title: z.string(),
  targetCount: z.number().int(),
  targetUnit: z.string(),
  estimatedSavingsWon: z.number().int(),
  savingsEstimateVersion: z.string(),
  savingsLabel: z.string(),
  status: missionStatusSchema,
  weekEndsAt: z.string(),
});
export type Mission = z.infer<typeof missionSchema>;

/** GET /api/missions 응답. */
export const missionsResponseSchema = z.object({
  missions: z.array(missionSchema),
});
export type MissionsResponse = z.infer<typeof missionsResponseSchema>;
