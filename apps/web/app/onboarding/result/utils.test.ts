import type { OnboardingProfile } from "@repo/schema/onboarding-api";
import { beforeEach, describe, expect, it } from "vitest";
import {
  clearMonthlyTargetDraft,
  getGoalReadyProfile,
  readMonthlyTargetDraft,
  saveMonthlyTargetDraft,
} from "./utils";

const profile: OnboardingProfile = {
  status: "IN_PROGRESS",
  birthDate: "1998-03-01",
  address: "SEOUL",
  monthlySalaryManwon: 300,
  monthlySavingManwon: 100,
  netWorthManwon: 2500,
  goalPeriodMonths: 24,
};

const preview = {
  monthlySavingManwon: 115,
  currentMonthlySavingManwon: 100,
  minMonthlySavingManwon: 100,
  maxMonthlySavingManwon: 150,
  recommendedMonthlySavingManwon: 115,
  periodMonths: 24,
  baseAmountManwon: 2500,
  additionalSavingManwon: 2760,
  expectedAmountManwon: 5260,
  extraMonthlyManwon: 15,
  extraPercent: 15,
};

describe("onboarding result utils", () => {
  beforeEach(() => localStorage.clear());

  it("완료된 설문 프로필만 목표 계산 값으로 좁힌다", () => {
    expect(getGoalReadyProfile(profile)).toEqual({
      monthlySalaryManwon: 300,
      monthlySavingManwon: 100,
      netWorthManwon: 2500,
      goalPeriodMonths: 24,
    });
    expect(getGoalReadyProfile({ ...profile, netWorthManwon: null })).toBeNull();
  });

  it("현재 사용자와 미리보기 범위에 해당하는 월 목표 draft만 복원한다", () => {
    saveMonthlyTargetDraft(preview, 1, 125);

    expect(readMonthlyTargetDraft(preview, 1)).toBe(125);
    expect(readMonthlyTargetDraft(preview, 2)).toBeNull();
  });

  it("월 목표 draft를 제거한다", () => {
    saveMonthlyTargetDraft(preview, 1, 125);
    clearMonthlyTargetDraft();

    expect(readMonthlyTargetDraft(preview, 1)).toBeNull();
  });
});
