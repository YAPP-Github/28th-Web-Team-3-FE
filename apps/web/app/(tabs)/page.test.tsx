import { render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import HomePage from "./page";

const replace = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace }),
}));

vi.mock("@/lib/onboarding-api", () => ({
  getOnboardingProfile: vi.fn(),
}));

import { getOnboardingProfile } from "@/lib/onboarding-api";

describe("HomePage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("온보딩을 완료했다면 홈을 렌더한다", async () => {
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
    expect(await screen.findByRole("heading", { name: "Web Team 3" })).toBeInTheDocument();
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
    expect(screen.queryByRole("heading", { name: "Web Team 3" })).not.toBeInTheDocument();
  });
});
