import { z } from "zod";

/**
 * 미션 API 계약 — 백엔드 OpenAPI(`/api/missions`) 기준.
 * `MissionLifecycleResponse`에는 자유 텍스트 설명이 없다 — `savingsLabel`이 그 역할을 한다.
 */

export const missionCategorySchema = z.enum(["MEAL", "TRANSPORT", "HOBBY", "LIVING"]);
export type MissionCategory = z.infer<typeof missionCategorySchema>;

export const activeMissionCategorySchema = z.enum(["MEAL", "HOBBY", "LIVING"]);
export type ActiveMissionCategory = z.infer<typeof activeMissionCategorySchema>;

export const missionItemSchema = z.enum([
  "DELIVERY_FOOD",
  "DINING_OUT",
  "DRINKING",
  "CAFE",
  "SNACK",
  "CONVENIENCE_STORE",
  "CLOTHING",
  "COSMETICS",
  "HOUSEHOLD_GOODS",
  "BEAUTY",
  "SELF_DEVELOPMENT",
  "HOBBY_GOODS",
  "GAME",
  "DIGITAL_CONTENT",
  "CLASS",
  "PERFORMANCE_TICKET",
  "CLUB_GATHERING",
  "EQUIPMENT_RENTAL",
  "SPACE_USE",
]);
export type MissionItem = z.infer<typeof missionItemSchema>;

export const MISSION_ITEM_CATEGORIES = {
  DELIVERY_FOOD: "MEAL",
  DINING_OUT: "MEAL",
  DRINKING: "MEAL",
  CAFE: "MEAL",
  SNACK: "MEAL",
  CONVENIENCE_STORE: "MEAL",
  CLOTHING: "LIVING",
  COSMETICS: "LIVING",
  HOUSEHOLD_GOODS: "LIVING",
  BEAUTY: "LIVING",
  SELF_DEVELOPMENT: "LIVING",
  HOBBY_GOODS: "HOBBY",
  GAME: "HOBBY",
  DIGITAL_CONTENT: "HOBBY",
  CLASS: "HOBBY",
  PERFORMANCE_TICKET: "HOBBY",
  CLUB_GATHERING: "HOBBY",
  EQUIPMENT_RENTAL: "HOBBY",
  SPACE_USE: "HOBBY",
} as const satisfies Record<MissionItem, ActiveMissionCategory>;

export const missionCatalogResponseSchema = z.object({
  categories: z.array(
    z
      .object({
        category: activeMissionCategorySchema,
        items: z.array(
          z.object({
            code: missionItemSchema,
            label: z.string(),
          }),
        ),
      })
      .superRefine((category, context) => {
        for (const [index, item] of category.items.entries()) {
          if (MISSION_ITEM_CATEGORIES[item.code] !== category.category) {
            context.addIssue({
              code: "custom",
              message: "미션 항목이 카테고리와 일치하지 않습니다.",
              path: ["items", index, "code"],
            });
          }
        }
      }),
  ),
});
export type MissionCatalogResponse = z.infer<typeof missionCatalogResponseSchema>;

export const missionSourceSchema = z.enum(["RECOMMENDED", "MANUAL"]);
export type MissionSource = z.infer<typeof missionSourceSchema>;

export const missionStatusSchema = z.enum(["ACTIVE", "COMPLETED", "INCOMPLETE"]);
export type MissionStatus = z.infer<typeof missionStatusSchema>;

/** POST /api/missions/manual 요청. 백엔드의 수동 미션 길이 제한과 같다. */
export const MAX_MANUAL_MISSION_TEXT_LENGTH = 30;
export const manualMissionCreateRequestSchema = z.object({
  category: activeMissionCategorySchema,
  text: z.string().trim().min(1).max(MAX_MANUAL_MISSION_TEXT_LENGTH),
});
export type ManualMissionCreateRequest = z.infer<typeof manualMissionCreateRequestSchema>;

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

/** GET /api/missions/progress 응답. 현재 주의 미션 달성 현황이다. */
export const missionProgressSchema = z
  .object({
    completedCount: z.number().int().nonnegative(),
    totalCount: z.number().int().nonnegative(),
    progressPercent: z.number().int().min(0).max(100),
    weekStartDate: z.iso.date(),
  })
  .refine((progress) => progress.completedCount <= progress.totalCount, {
    message: "completedCount must not exceed totalCount",
    path: ["completedCount"],
  });
export type MissionProgress = z.infer<typeof missionProgressSchema>;

/** GET /api/missions/histories 응답의 월별 주차 미션 완료 현황. */
export const missionWeeklyHistorySchema = z
  .object({
    completedCount: z.number().int().nonnegative(),
    isCurrentWeek: z.boolean(),
    totalCount: z.number().int().nonnegative(),
    weekEndDate: z.iso.date(),
    weekOfMonth: z.number().int().positive(),
    weekStartDate: z.iso.date(),
  })
  .refine((history) => history.completedCount <= history.totalCount, {
    message: "completedCount must not exceed totalCount",
    path: ["completedCount"],
  });
export type MissionWeeklyHistory = z.infer<typeof missionWeeklyHistorySchema>;

export const missionHistoriesResponseSchema = z.object({
  histories: z.array(missionWeeklyHistorySchema),
});
export type MissionHistoriesResponse = z.infer<typeof missionHistoriesResponseSchema>;
