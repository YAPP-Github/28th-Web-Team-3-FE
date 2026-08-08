import { describe, expect, it } from "vitest";
import { calculateGoalProgressPercent, calculateGoalTotalTargetManwon } from "./progress";

describe("goal progress", () => {
  it("서버 목표금액을 전체 목표금액으로 사용한다", () => {
    expect(calculateGoalTotalTargetManwon(1950, 5000)).toBe(5000);
  });

  it("서버 달성률 대신 전체 목표금액 기준으로 달성률을 계산한다", () => {
    expect(calculateGoalProgressPercent(1950, 5000)).toBe(39);
  });
});
