import { describe, expect, it } from "vitest";
import {
  calculateAdditionalTargetManwon,
  calculateGoalProgressPercent,
  calculateGoalTotalTargetManwon,
} from "./progress";

describe("goal progress", () => {
  it("추가 목표액과 현재 저축액으로 전체 목표금액을 계산한다", () => {
    expect(calculateGoalTotalTargetManwon(1950, 3050)).toBe(5000);
  });

  it("서버 달성률 대신 전체 목표금액 기준으로 달성률을 계산한다", () => {
    expect(calculateGoalProgressPercent(1950, 5000)).toBe(39);
  });

  it("전체 목표금액 입력값을 추가 목표액으로 환산한다", () => {
    expect(calculateAdditionalTargetManwon(5000, 1950)).toBe(3050);
  });
});
