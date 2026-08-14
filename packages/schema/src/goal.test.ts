import { describe, expect, it } from "vitest";
import { goalStatusSchema } from "./goal";

const GOAL_V2_RESPONSE = {
  targetAmountManwon: 5000,
  periodMonths: 16,
  totalSavedManwon: 1950,
  progressPercent: 39,
  usageMonths: 8,
  deadlineDDay: 486,
  thisMonth: { targetManwon: 82, savedManwon: 67, progressPercent: 82, dDay: 12 },
  monthlySavings: [
    { yearMonth: "2026-07", savedManwon: 80, current: false },
    { yearMonth: "2026-08", savedManwon: 67, current: true },
  ],
};

describe("goalStatusSchema", () => {
  it("Goal v2의 월별 저축 현황을 응답에서 보존한다", () => {
    expect(goalStatusSchema.parse(GOAL_V2_RESPONSE)).toEqual(GOAL_V2_RESPONSE);
  });

  it("월별 저축 현황이 없는 v1 응답을 거부한다", () => {
    const { monthlySavings: _, ...v1Response } = GOAL_V2_RESPONSE;

    expect(goalStatusSchema.safeParse(v1Response).success).toBe(false);
  });
});
