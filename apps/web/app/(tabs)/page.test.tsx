import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import HomePage from "./page";

const replace = vi.fn();
const router = { replace };

vi.mock("next/navigation", () => ({
  useRouter: () => router,
}));

vi.mock("@/lib/onboarding", () => ({
  getOnboardingProfile: vi.fn(),
}));

import { getOnboardingProfile } from "@/lib/onboarding";

describe("HomePage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("온보딩을 완료했다면 제목과 모으기 라인을 렌더한다", async () => {
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
    expect(await screen.findByRole("heading", { name: "홈" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /5,000만원 모으기/ })).toHaveAttribute("href", "/goal");
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
