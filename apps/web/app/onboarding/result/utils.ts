import type { OnboardingGoalPreview, OnboardingProfile } from "@repo/schema/onboarding-api";

export interface GoalReadyProfile {
  monthlySalaryManwon: number;
  monthlySavingManwon: number;
  netWorthManwon: number;
  goalPeriodMonths: number;
}

interface MonthlyTargetDraft {
  userId: number;
  profileFingerprint: string;
  monthlyTargetManwon: number;
}

const MONTHLY_TARGET_DRAFT_STORAGE_KEY = "onboarding:monthly-target-draft";

export function getGoalReadyProfile(profile: OnboardingProfile): GoalReadyProfile | null {
  if (
    profile.birthDate === null ||
    profile.address === null ||
    profile.monthlySalaryManwon === null ||
    profile.monthlySavingManwon === null ||
    profile.netWorthManwon === null ||
    profile.goalPeriodMonths === null
  ) {
    return null;
  }

  return {
    monthlySalaryManwon: profile.monthlySalaryManwon,
    monthlySavingManwon: profile.monthlySavingManwon,
    netWorthManwon: profile.netWorthManwon,
    goalPeriodMonths: profile.goalPeriodMonths,
  };
}

function getProfileFingerprint({
  currentMonthlySavingManwon,
  minMonthlySavingManwon,
  maxMonthlySavingManwon,
  recommendedMonthlySavingManwon,
  periodMonths,
  baseAmountManwon,
}: OnboardingGoalPreview) {
  const source = `${currentMonthlySavingManwon}:${minMonthlySavingManwon}:${maxMonthlySavingManwon}:${recommendedMonthlySavingManwon}:${periodMonths}:${baseAmountManwon}`;
  let hash = 2_166_136_261;

  for (const character of source) {
    hash ^= character.charCodeAt(0);
    hash = Math.imul(hash, 16_777_619);
  }

  return (hash >>> 0).toString(36);
}

export function readMonthlyTargetDraft(
  preview: OnboardingGoalPreview,
  userId: number,
): number | null {
  try {
    const storedDraft = localStorage.getItem(MONTHLY_TARGET_DRAFT_STORAGE_KEY);
    if (!storedDraft) return null;

    const draft = JSON.parse(storedDraft) as Partial<MonthlyTargetDraft>;
    const isCurrentProfile =
      draft.userId === userId && draft.profileFingerprint === getProfileFingerprint(preview);
    const monthlyTargetManwon = draft.monthlyTargetManwon;
    const isValidTarget =
      typeof monthlyTargetManwon === "number" &&
      Number.isInteger(monthlyTargetManwon) &&
      monthlyTargetManwon >= preview.minMonthlySavingManwon &&
      monthlyTargetManwon <= preview.maxMonthlySavingManwon;

    if (isCurrentProfile && isValidTarget) return monthlyTargetManwon;
    localStorage.removeItem(MONTHLY_TARGET_DRAFT_STORAGE_KEY);
  } catch {
    // 손상된 값이거나 저장소 접근이 막힌 환경이면 기본 추천값을 사용한다.
  }

  return null;
}

export function saveMonthlyTargetDraft(
  preview: OnboardingGoalPreview,
  userId: number,
  monthlyTargetManwon: number,
) {
  const draft: MonthlyTargetDraft = {
    userId,
    profileFingerprint: getProfileFingerprint(preview),
    monthlyTargetManwon,
  };

  try {
    localStorage.setItem(MONTHLY_TARGET_DRAFT_STORAGE_KEY, JSON.stringify(draft));
  } catch {
    // 저장 공간을 사용할 수 없어도 현재 화면의 목표 설정은 계속할 수 있다.
  }
}

export function clearMonthlyTargetDraft() {
  try {
    localStorage.removeItem(MONTHLY_TARGET_DRAFT_STORAGE_KEY);
  } catch {
    // 목표 확정 자체는 로컬 저장소 상태와 무관하게 완료한다.
  }
}
