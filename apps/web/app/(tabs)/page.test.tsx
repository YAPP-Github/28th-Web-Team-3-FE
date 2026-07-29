import type { Mission } from "@repo/schema/mission";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ONBOARDING_PROFILE_QUERY_KEY } from "@/lib/onboarding/queries";
import { createTestQueryClient, fireEvent, render, screen, waitFor } from "@/lib/test/react";
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

vi.mock("@/lib/onboarding/api", () => ({
  getOnboardingProfile: vi.fn(),
}));

// 홈 목표 섹션은 목표 상세와 같은 `useGoalStatus`로 실데이터를 조회한다.
// jsdom은 msw/node fetch를 가로채지 못하므로 훅을 목으로 대체해 데이터를 주입한다.
vi.mock("@/app/goal/queries", () => ({
  useGoalStatus: () => ({
    data: {
      targetAmountManwon: 5000,
      totalSavedManwon: 1950,
      progressPercent: 100,
      usageMonths: 8,
      deadlineDDay: 486,
      thisMonth: { targetManwon: 82, savedManwon: 67, progressPercent: 82, dDay: 12 },
    },
    isPending: false,
    isError: false,
  }),
  useUpdateSavings: () => ({ isPending: false, mutate: vi.fn() }),
  useUpdateGoal: () => ({ isPending: false, mutate: vi.fn() }),
}));

vi.mock("@/app/(tabs)/mission/queries", () => ({
  useMissions: () => ({ data: MOCK_MISSIONS, isPending: false, isError: false }),
  useCompleteMission: () => ({ mutate: vi.fn() }),
}));

import { getOnboardingProfile } from "@/lib/onboarding/api";

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

  it("캐시된 프로필이 있으면 재조회가 실패해도 홈을 계속 보여준다", async () => {
    // react-query는 재조회가 실패해도 이전 데이터를 버리지 않고 isError만 켠다.
    // 그 상태에서 오류 화면으로 갈아치우면 멀쩡히 그릴 수 있는 화면이 사라진다.
    const queryClient = createTestQueryClient();
    queryClient.setQueryData(ONBOARDING_PROFILE_QUERY_KEY, {
      status: "COMPLETED",
      birthDate: "1998-03-01",
      monthlySalaryManwon: 300,
      monthlySavingManwon: 100,
      netWorthManwon: 1000,
      goalPeriodMonths: 24,
    });
    vi.mocked(getOnboardingProfile).mockRejectedValue(new Error("network error"));

    render(<HomePage />, { queryClient });

    // 마운트 직후 stale 재조회가 나가 실패한다(테스트 클라이언트는 retry를 끈다).
    // 오류가 실제로 정착한 뒤에 봐야 한다 — 안 그러면 검사가 헛돈다.
    await waitFor(() =>
      expect(queryClient.getQueryState(ONBOARDING_PROFILE_QUERY_KEY)?.status).toBe("error"),
    );
    expect(queryClient.getQueryData(ONBOARDING_PROFILE_QUERY_KEY)).toBeDefined();
    expect(screen.getByRole("heading", { name: "홈" })).toBeInTheDocument();
    expect(screen.queryByText("사용자 정보를 불러오지 못했어요.")).not.toBeInTheDocument();
  });
});
