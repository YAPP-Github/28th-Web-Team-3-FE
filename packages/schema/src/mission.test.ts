import { describe, expect, it } from "vitest";
import {
  MAX_MANUAL_MISSION_TEXT_LENGTH,
  manualMissionCreateRequestSchema,
  missionCatalogResponseSchema,
  missionHistoriesResponseSchema,
  missionProgressSchema,
  missionsResponseSchema,
} from "./mission";

const commonMission = {
  id: "mission-1",
  category: "LIVING",
  title: "사용하지 않는 구독 정리하기",
  status: "ACTIVE",
  weekEndsAt: "2099-01-01T00:00:00Z",
} as const;

describe("mission API schemas", () => {
  it("절약 추정 필드가 생략된 수동 미션 응답을 파싱한다", () => {
    expect(
      missionsResponseSchema.parse({
        missions: [{ ...commonMission, source: "MANUAL" }],
      }).missions[0],
    ).toEqual({ ...commonMission, source: "MANUAL" });
  });

  it("추천 미션에는 절약 추정 필드를 요구한다", () => {
    expect(() =>
      missionsResponseSchema.parse({
        missions: [{ ...commonMission, source: "RECOMMENDED" }],
      }),
    ).toThrow();
  });

  it("카탈로그에서 카테고리와 항목이 일치해야 한다", () => {
    expect(() =>
      missionCatalogResponseSchema.parse({
        categories: [
          {
            category: "MEAL",
            items: [{ code: "GAME", label: "게임" }],
          },
        ],
      }),
    ).toThrow();
  });

  it("수동 미션 요청의 공백을 정리하고 30자까지만 허용한다", () => {
    expect(
      manualMissionCreateRequestSchema.parse({ category: "MEAL", text: "  집밥 먹기  " }),
    ).toEqual({ category: "MEAL", text: "집밥 먹기" });

    expect(() =>
      manualMissionCreateRequestSchema.parse({
        category: "MEAL",
        text: "가".repeat(MAX_MANUAL_MISSION_TEXT_LENGTH + 1),
      }),
    ).toThrow();
  });

  it("현재 주 미션 진행률 응답을 검증한다", () => {
    expect(
      missionProgressSchema.parse({
        completedCount: 1,
        progressPercent: 25,
        totalCount: 4,
        weekStartDate: "2026-08-10",
      }),
    ).toEqual({
      completedCount: 1,
      progressPercent: 25,
      totalCount: 4,
      weekStartDate: "2026-08-10",
    });

    expect(() =>
      missionProgressSchema.parse({
        completedCount: 5,
        progressPercent: 100,
        totalCount: 4,
        weekStartDate: "2026-08-10",
      }),
    ).toThrow();
  });

  it("월별 주차 미션 완료 내역 응답을 검증한다", () => {
    expect(
      missionHistoriesResponseSchema.parse({
        histories: [
          {
            completedCount: 1,
            isCurrentWeek: true,
            totalCount: 4,
            weekEndDate: "2026-08-23",
            weekOfMonth: 3,
            weekStartDate: "2026-08-17",
          },
        ],
      }),
    ).toEqual({
      histories: [
        {
          completedCount: 1,
          isCurrentWeek: true,
          totalCount: 4,
          weekEndDate: "2026-08-23",
          weekOfMonth: 3,
          weekStartDate: "2026-08-17",
        },
      ],
    });

    expect(() =>
      missionHistoriesResponseSchema.parse({
        histories: [
          {
            completedCount: 5,
            isCurrentWeek: true,
            totalCount: 4,
            weekEndDate: "2026-08-23",
            weekOfMonth: 3,
            weekStartDate: "2026-08-17",
          },
        ],
      }),
    ).toThrow();
  });
});
