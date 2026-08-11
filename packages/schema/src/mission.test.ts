import { describe, expect, it } from "vitest";
import { missionCatalogResponseSchema, missionsResponseSchema } from "./mission";

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
});
