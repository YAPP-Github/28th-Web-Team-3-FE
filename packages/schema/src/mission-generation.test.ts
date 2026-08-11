import { describe, expect, it } from "vitest";
import {
  MAX_MISSION_BASELINE_AMOUNT_WON,
  MAX_MISSION_BASELINE_FREQUENCY,
  missionGenerationCreateRequestSchema,
} from "./mission-generation";

const validRequest = {
  category: "MEAL",
  item: "DELIVERY_FOOD",
  baselineFrequency: 3,
  baselineAmountWon: 50_000,
} as const;

describe("mission generation API schemas", () => {
  it("카테고리·항목·주간 횟수·금액 생성 요청을 파싱한다", () => {
    expect(missionGenerationCreateRequestSchema.parse(validRequest)).toEqual(validRequest);
  });

  it("백엔드 허용 범위를 넘는 횟수와 금액을 거부한다", () => {
    expect(() =>
      missionGenerationCreateRequestSchema.parse({
        ...validRequest,
        baselineFrequency: MAX_MISSION_BASELINE_FREQUENCY + 1,
      }),
    ).toThrow();
    expect(() =>
      missionGenerationCreateRequestSchema.parse({
        ...validRequest,
        baselineAmountWon: MAX_MISSION_BASELINE_AMOUNT_WON + 1,
      }),
    ).toThrow();
  });

  it("비활성 카테고리와 카테고리에 속하지 않은 항목을 거부한다", () => {
    expect(() =>
      missionGenerationCreateRequestSchema.parse({
        ...validRequest,
        category: "TRANSPORT",
      }),
    ).toThrow();
    expect(() =>
      missionGenerationCreateRequestSchema.parse({
        ...validRequest,
        item: "GAME",
      }),
    ).toThrow();
  });

  it("횟수와 금액은 정수이며 최솟값 이상이어야 한다", () => {
    expect(() =>
      missionGenerationCreateRequestSchema.parse({
        ...validRequest,
        baselineFrequency: 1.5,
      }),
    ).toThrow();
    expect(() =>
      missionGenerationCreateRequestSchema.parse({
        ...validRequest,
        baselineFrequency: 0,
      }),
    ).toThrow();
    expect(() =>
      missionGenerationCreateRequestSchema.parse({
        ...validRequest,
        baselineAmountWon: 0,
      }),
    ).toThrow();
  });
});
