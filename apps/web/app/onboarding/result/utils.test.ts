import type { OnboardingProfile } from "@repo/schema/onboarding-api";
import { beforeEach, describe, expect, it } from "vitest";
import {
  clearMonthlyTargetDraft,
  getDefaultMonthlyTarget,
  getGoalReadyProfile,
  getMaxMonthlyTarget,
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

  it("월 목표 기본값과 상한을 기존 저축액 및 월급으로 계산한다", () => {
    expect(getDefaultMonthlyTarget(100, 300)).toBe(115);
    expect(getMaxMonthlyTarget(100, 300)).toBe(150);
    expect(getMaxMonthlyTarget(100, 120)).toBe(120);
  });

  it("현재 사용자와 프로필에 해당하는 월 목표 draft만 복원한다", () => {
    const goalReadyProfile = getGoalReadyProfile(profile);
    expect(goalReadyProfile).not.toBeNull();
    if (!goalReadyProfile) return;

    saveMonthlyTargetDraft(goalReadyProfile, 1, 125);

    expect(readMonthlyTargetDraft(goalReadyProfile, 1)).toBe(125);
    expect(readMonthlyTargetDraft(goalReadyProfile, 2)).toBeNull();
  });

  it("월 목표 draft를 제거한다", () => {
    const goalReadyProfile = getGoalReadyProfile(profile);
    expect(goalReadyProfile).not.toBeNull();
    if (!goalReadyProfile) return;

    saveMonthlyTargetDraft(goalReadyProfile, 1, 125);
    clearMonthlyTargetDraft();

    expect(readMonthlyTargetDraft(goalReadyProfile, 1)).toBeNull();
  });
});
