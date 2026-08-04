import type { Mission } from "@repo/schema/mission";
import { describe, expect, it } from "vitest";
import { formatSavedAmount } from "./format";

function mission(estimatedSavingsWon: number, status: Mission["status"]): Mission {
  return {
    id: `mission-${estimatedSavingsWon}-${status}`,
    source: "RECOMMENDED",
    category: "MEAL",
    title: "테스트 미션",
    targetCount: 1,
    targetUnit: "TIMES_PER_WEEK",
    estimatedSavingsWon,
    savingsEstimateVersion: "V1",
    savingsLabel: "약 5,000원 절약 예상",
    status,
    weekEndsAt: "2099-01-01T00:00:00Z",
  };
}

describe("formatSavedAmount", () => {
  it("완료한 미션의 절약 금액만 더한다", () => {
    expect(
      formatSavedAmount([
        mission(20000, "COMPLETED"),
        mission(10000, "COMPLETED"),
        mission(50000, "ACTIVE"),
      ]),
    ).toBe("약 3만원");
  });

  it("완료한 미션이 없으면 0원이다", () => {
    expect(formatSavedAmount([mission(50000, "ACTIVE")])).toBe("약 0원");
    expect(formatSavedAmount([])).toBe("약 0원");
  });

  // 만원으로 반올림하면 "약 0원"이 된다 — 완료했는데 0원으로 보이면 안 된다.
  it("만원 미만은 원 단위로 보여준다", () => {
    expect(formatSavedAmount([mission(4000, "COMPLETED")])).toBe("약 4,000원");
    expect(formatSavedAmount([mission(9999, "COMPLETED")])).toBe("약 9,999원");
  });

  it("만원 이상은 가장 가까운 만원으로 어림한다", () => {
    expect(formatSavedAmount([mission(10000, "COMPLETED")])).toBe("약 1만원");
    expect(formatSavedAmount([mission(15000, "COMPLETED")])).toBe("약 2만원");
    expect(formatSavedAmount([mission(1234567, "COMPLETED")])).toBe("약 123만원");
  });
});
