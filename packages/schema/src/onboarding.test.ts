import { describe, expect, it } from "vitest";
import { onboardingFormSchema } from "./onboarding";

describe("onboardingFormSchema", () => {
  it("백엔드 계약 필드와 한도를 검증한다", () => {
    expect(
      onboardingFormSchema.parse({
        birthDate: "1998-03-01",
        address: "SEOUL",
        monthlySalaryManwon: 300,
        monthlySavingManwon: 100,
        netWorthManwon: 10_000,
        goalPeriodMonths: 24,
      }),
    ).toBeDefined();
    expect(
      onboardingFormSchema.safeParse({
        birthDate: "1998.03.01",
        address: "GWANGJU",
        monthlySalaryManwon: 651,
        monthlySavingManwon: 100,
        netWorthManwon: 10_001,
        goalPeriodMonths: 37,
      }).success,
    ).toBe(false);
  });
});
