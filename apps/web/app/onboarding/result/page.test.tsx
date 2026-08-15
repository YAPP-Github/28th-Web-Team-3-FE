import { beforeEach, describe, expect, it, vi } from "vitest";
import { getCurrentUser } from "@/api/auth";
import { confirmOnboardingGoal, getOnboardingProfile } from "@/api/onboarding";
import { fireEvent, render, screen, waitFor } from "@/lib/test/react";
import OnboardingResultPage from "./page";

const replace = vi.fn();
const { ALREADY_COMPLETED_ERROR } = vi.hoisted(() => ({
  ALREADY_COMPLETED_ERROR: new Error("ONBOARDING_ALREADY_COMPLETED"),
}));

vi.mock("next/navigation", () => ({ useRouter: () => ({ replace }) }));
vi.mock("@/api/auth", () => ({ getCurrentUser: vi.fn() }));
vi.mock("@/api/onboarding", () => ({
  confirmOnboardingGoal: vi.fn(),
  getOnboardingProfile: vi.fn(),
  isOnboardingAlreadyCompletedError: (error: unknown) => error === ALREADY_COMPLETED_ERROR,
}));

const profile = {
  status: "IN_PROGRESS" as const,
  birthDate: "1998-03-01",
  address: "SEOUL" as const,
  monthlySalaryManwon: 300,
  monthlySavingManwon: 100,
  netWorthManwon: 2500,
  goalPeriodMonths: 24,
};

describe("OnboardingResultPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    vi.mocked(getCurrentUser).mockResolvedValue({ userId: 1, onboardingCompleted: false });
    vi.mocked(getOnboardingProfile).mockResolvedValue(profile);
    vi.mocked(confirmOnboardingGoal).mockResolvedValue({
      goalId: 1,
      plan: "PLAN_1",
      periodMonths: 24,
      targetAmountManwon: 2760,
      status: "COMPLETED",
    });
  });

  it("현재 저축액보다 15% 높은 월 목표와 총 예상 금액을 표시한다", async () => {
    render(<OnboardingResultPage />);

    expect(await screen.findByText("5,260만원")).toBeInTheDocument();
    expect(screen.getByText("매달 모을 금액 115만원")).toBeInTheDocument();
    expect(screen.getByRole("slider", { name: "매달 모을 금액" })).toHaveAttribute(
      "aria-valuemax",
      "150",
    );
  });

  it("슬라이더로 바꾼 월 목표를 확정하고 홈으로 교체 이동한다", async () => {
    render(<OnboardingResultPage />);
    const slider = await screen.findByRole("slider", { name: "매달 모을 금액" });
    fireEvent.keyDown(slider, { key: "ArrowRight" });
    fireEvent.click(screen.getByRole("button", { name: "이 목표로 시작" }));

    await waitFor(() =>
      expect(confirmOnboardingGoal).toHaveBeenCalledWith({
        plan: "PLAN_1",
        monthlyTargetManwon: 116,
      }),
    );
    expect(replace).toHaveBeenCalledWith("/");
  });

  it("이전 화면이나 새 렌더를 거쳐도 조정한 월 목표 draft를 복원한다", async () => {
    const firstRender = render(<OnboardingResultPage />);
    const slider = await screen.findByRole("slider", { name: "매달 모을 금액" });
    fireEvent.keyDown(slider, { key: "ArrowRight" });
    await screen.findByText("매달 모을 금액 116만원");
    firstRender.unmount();

    render(<OnboardingResultPage />);

    expect(await screen.findByText("매달 모을 금액 116만원")).toBeInTheDocument();
  });

  it("다른 사용자에게 이전 사용자의 월 목표 draft를 복원하지 않는다", async () => {
    const firstRender = render(<OnboardingResultPage />);
    const slider = await screen.findByRole("slider", { name: "매달 모을 금액" });
    fireEvent.keyDown(slider, { key: "ArrowRight" });
    await screen.findByText("매달 모을 금액 116만원");
    firstRender.unmount();
    vi.mocked(getCurrentUser).mockResolvedValue({ userId: 2, onboardingCompleted: false });

    render(<OnboardingResultPage />);

    expect(await screen.findByText("매달 모을 금액 115만원")).toBeInTheDocument();
  });

  it("목표를 확정하면 저장한 월 목표 draft를 제거한다", async () => {
    const firstRender = render(<OnboardingResultPage />);
    const slider = await screen.findByRole("slider", { name: "매달 모을 금액" });
    fireEvent.keyDown(slider, { key: "ArrowRight" });
    fireEvent.click(screen.getByRole("button", { name: "이 목표로 시작" }));
    await waitFor(() => expect(replace).toHaveBeenCalledWith("/"));
    firstRender.unmount();

    render(<OnboardingResultPage />);

    expect(await screen.findByText("매달 모을 금액 115만원")).toBeInTheDocument();
  });

  it("이전 버튼은 확인 화면으로 교체 이동해 왕복 히스토리를 만들지 않는다", async () => {
    render(<OnboardingResultPage />);
    fireEvent.click(await screen.findByRole("button", { name: "이전" }));

    expect(replace).toHaveBeenCalledWith("/onboarding/check");
  });

  it("필수 설문이 비어 있으면 확정 화면 대신 확인 화면 복귀를 안내한다", async () => {
    vi.mocked(getOnboardingProfile).mockResolvedValue({ ...profile, netWorthManwon: null });

    render(<OnboardingResultPage />);
    fireEvent.click(await screen.findByRole("button", { name: "설문 확인으로 돌아가기" }));

    expect(confirmOnboardingGoal).not.toHaveBeenCalled();
    expect(replace).toHaveBeenCalledWith("/onboarding/check");
  });

  it("서버에 이미 확정된 재시도는 오류에 머물지 않고 홈으로 복구한다", async () => {
    vi.mocked(confirmOnboardingGoal).mockRejectedValue(ALREADY_COMPLETED_ERROR);

    render(<OnboardingResultPage />);
    fireEvent.click(await screen.findByRole("button", { name: "이 목표로 시작" }));

    await waitFor(() => expect(replace).toHaveBeenCalledWith("/"));
    expect(screen.queryByText("목표를 저장하지 못했어요. 잠시 후 다시 시도해 주세요.")).toBeNull();
  });
});
