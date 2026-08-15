import { describe, expect, it } from "vitest";
import {
  onboardingGoalConfirmSchema,
  onboardingGoalPlansSchema,
  onboardingProfilePatchSchema,
  onboardingReportSchema,
} from "./onboarding-api";

describe("onboarding API schemas", () => {
  it("accepts a step-specific profile patch", () => {
    expect(
      onboardingProfilePatchSchema.parse({
        birthDate: "1998-03-01",
        address: "SEOUL",
      }),
    ).toEqual({
      birthDate: "1998-03-01",
      address: "SEOUL",
    });
  });

  it("rejects values outside the backend constraints", () => {
    expect(() => onboardingProfilePatchSchema.parse({ monthlySalaryManwon: 651 })).toThrow();
    expect(() => onboardingProfilePatchSchema.parse({ netWorthManwon: 10_001 })).toThrow();
    expect(() => onboardingProfilePatchSchema.parse({ goalPeriodMonths: 2 })).toThrow();
    expect(() => onboardingProfilePatchSchema.parse({ address: "GWANGJU" })).toThrow();
    expect(() =>
      onboardingGoalConfirmSchema.parse({ plan: "PLAN_1", monthlySavingManwon: 651 }),
    ).toThrow();
  });

  it("accepts a monthly target with the legacy plan", () => {
    expect(onboardingGoalConfirmSchema.parse({ plan: "PLAN_1", monthlySavingManwon: 115 })).toEqual(
      { plan: "PLAN_1", monthlySavingManwon: 115 },
    );
  });

  it("parses report and goal-plan response shapes", () => {
    const series = {
      bins: [{ lowerManwon: 0, upperManwon: null, ratio: 0.1, density: 0.2 }],
      markerManwon: 300,
    };
    expect(
      onboardingReportSchema.parse({
        simulation: {
          baselineManwon: 100,
          simulationManwon: 115,
          diffManwon: 15,
          upliftPercent: 15,
          periodMonths: 24,
        },
        peer: { assetRatioPercent: 36, incomeTopPercent: 40, consumptionTopPercent: 50 },
        histogram: { income: series, consumption: series },
        diagnosis: { branchCode: 1, message: "message" },
        disclaimer: "disclaimer",
        datasetVersion: "dataset-v1",
        configVersion: "config-v1",
      }).simulation.diffManwon,
    ).toBe(15);

    expect(
      onboardingGoalPlansSchema.parse({
        monthlySavingManwon: 100,
        periodMonths: 24,
        plans: [
          {
            plan: "PLAN_1",
            label: "현실적으로",
            default: true,
            increaseMinManwon: 10,
            increaseMaxManwon: 20,
            checkpoints: [{ month: 6, amountManwon: 600 }],
            card: { month: 24, amountManwon: 2400 },
          },
        ],
      }).plans[0]?.plan,
    ).toBe("PLAN_1");
  });
});
