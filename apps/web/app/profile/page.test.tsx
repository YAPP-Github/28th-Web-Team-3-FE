import type { OnboardingProfile } from "@repo/schema/onboarding-api";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@/lib/test/react";
import ProfilePage from "./page";

const PROFILE: OnboardingProfile = {
  status: "COMPLETED",
  birthDate: "2002-10-24",
  monthlySalaryManwon: 500,
  monthlySavingManwon: 100,
  netWorthManwon: 5000,
  goalPeriodMonths: 24,
};

vi.mock("next/navigation", () => ({
  useRouter: () => ({ back: vi.fn(), replace: vi.fn() }),
}));

vi.mock("@/api/onboarding", () => ({
  confirmOnboardingGoal: vi.fn(),
  getOnboardingGoalPlans: vi.fn(),
  getOnboardingProfile: vi.fn(),
  getOnboardingReport: vi.fn(),
  patchOnboardingProfile: vi.fn(),
}));

import { getOnboardingProfile } from "@/api/onboarding";

describe("ProfilePage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getOnboardingProfile).mockResolvedValue(PROFILE);
  });

  it("온보딩 프로필을 내 정보 형식으로 보여준다", async () => {
    render(<ProfilePage />);

    expect(await screen.findByRole("heading", { name: "내 정보" })).toBeInTheDocument();
    expect(await screen.findByText("2002.10.24")).toBeInTheDocument();
    expect(screen.getByText("500만원")).toBeInTheDocument();
    expect(screen.getByText("100만원")).toBeInTheDocument();
    expect(screen.getByText("5,000만원")).toBeInTheDocument();
    expect(screen.getByText("2년 미만")).toBeInTheDocument();
  });

  it("공용 수정 화면으로 이동하는 링크를 제공한다", async () => {
    render(<ProfilePage />);

    await screen.findByText("2002.10.24");
    expect(screen.getByRole("link", { name: "수정" })).toHaveAttribute("href", "/profile/edit");
  });
});
