import type { Mission } from "@repo/schema/mission";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import HomePage from "./page";

const replace = vi.fn();
const router = { replace };

const MOCK_MISSIONS: Mission[] = [
  {
    id: "meal-1",
    source: "RECOMMENDED",
    category: "MEAL",
    title: "이번 주 배달음식 2회 이하로 주문",
    targetCount: 2,
    targetUnit: "TIMES_PER_WEEK",
    estimatedSavingsWon: 5000,
    savingsEstimateVersion: "V1",
    savingsLabel: "약 5,000원 절약 예상",
    status: "ACTIVE",
    weekEndsAt: "2099-01-01T00:00:00Z",
  },
];

vi.mock("next/navigation", () => ({
  useRouter: () => router,
}));

vi.mock("@/lib/onboarding", () => ({
  getOnboardingProfile: vi.fn(),
}));

// 홈 목표 섹션은 목표 상세와 같은 `useGoalStatus`로 실데이터를 조회한다.
// jsdom은 msw/node fetch를 가로채지 못하므로 훅을 목으로 대체해 데이터를 주입한다.
vi.mock("@/app/goal/queries", () => ({
  useGoalStatus: () => ({
    data: {
      targetAmountManwon: 5000,
      totalSavedManwon: 1950,
      progressPercent: 39,
      usageMonths: 8,
      deadlineDDay: 486,
      thisMonth: { targetManwon: 82, savedManwon: 67, progressPercent: 82, dDay: 12 },
    },
    isPending: false,
    isError: false,
  }),
  useUpdateSavings: () => ({ isPending: false, mutate: vi.fn() }),
}));

vi.mock("@/app/(tabs)/mission/queries", () => ({
  useMissions: () => ({ data: MOCK_MISSIONS, isPending: false, isError: false }),
  useCompleteMission: () => ({ mutate: vi.fn() }),
}));

import { getOnboardingProfile } from "@/lib/onboarding";

describe("HomePage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("온보딩을 완료했다면 Figma 홈의 목표·미션·팁 섹션을 렌더한다", async () => {
    vi.mocked(getOnboardingProfile).mockResolvedValue({
      status: "COMPLETED",
      birthDate: "1998-03-01",
      monthlySalaryManwon: 300,
      monthlySavingManwon: 100,
      netWorthManwon: 1000,
      goalPeriodMonths: 24,
    });

    render(<HomePage />);

    expect(screen.getByRole("main")).toHaveAttribute("aria-busy", "true");
    expect(screen.queryByRole("heading", { name: "홈" })).not.toBeInTheDocument();
    expect(await screen.findByRole("heading", { name: "홈" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /5,000만원 모으기/ })).toHaveAttribute("href", "/goal");
    expect(screen.getByRole("heading", { name: "이번 주 미션" })).toBeInTheDocument();
    expect(screen.getByText("이번 주 배달음식 2회 이하로 주문")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "재테크 선배의 팁" })).toBeInTheDocument();
  });

  it("온보딩이 미완료면 소개 화면으로 교체 이동한다", async () => {
    vi.mocked(getOnboardingProfile).mockResolvedValue({
      status: "IN_PROGRESS",
      birthDate: null,
      monthlySalaryManwon: null,
      monthlySavingManwon: null,
      netWorthManwon: null,
      goalPeriodMonths: null,
    });

    render(<HomePage />);

    await waitFor(() => expect(replace).toHaveBeenCalledWith("/onboarding/intro"));
    expect(screen.queryByRole("heading", { name: "홈" })).not.toBeInTheDocument();
  });

  it("프로필 조회 실패를 미완료로 오인하지 않고 재시도한다", async () => {
    vi.mocked(getOnboardingProfile)
      .mockRejectedValueOnce(new Error("network error"))
      .mockResolvedValueOnce({
        status: "COMPLETED",
        birthDate: "1998-03-01",
        monthlySalaryManwon: 300,
        monthlySavingManwon: 100,
        netWorthManwon: 1000,
        goalPeriodMonths: 24,
      });

    render(<HomePage />);

    fireEvent.click(await screen.findByRole("button", { name: "다시 시도" }));
    expect(await screen.findByRole("heading", { name: "홈" })).toBeInTheDocument();
    expect(replace).not.toHaveBeenCalled();
  });
});
