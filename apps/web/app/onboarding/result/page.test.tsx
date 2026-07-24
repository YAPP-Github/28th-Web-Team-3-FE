import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { getOnboardingReport } from "@/lib/onboarding-api";
import OnboardingResultPage from "./page";

const push = vi.fn();

vi.mock("next/navigation", () => ({ useRouter: () => ({ push }) }));
vi.mock("@/lib/onboarding-api", () => ({
  getOnboardingReport: vi.fn(),
}));

const report = {
  simulation: {
    baselineManwon: 11_200,
    simulationManwon: 11_380,
    diffManwon: 180,
    upliftPercent: 2,
    periodMonths: 12,
  },
  peer: { assetRatioPercent: 50, incomeTopPercent: 30, consumptionTopPercent: 40 },
  histogram: {
    income: { bins: [], markerManwon: 300 },
    consumption: { bins: [], markerManwon: 200 },
  },
  diagnosis: { branchCode: 1, message: "저축액을 조금 높이면 목표에 가까워져요." },
  disclaimer: "안내",
  datasetVersion: "1",
  configVersion: "1",
};

describe("OnboardingResultPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getOnboardingReport).mockResolvedValue(report);
  });

  it("report 응답을 표시한다", async () => {
    render(<OnboardingResultPage />);
    expect(await screen.findByText("11,380만원 예상")).toBeInTheDocument();
    expect(screen.getByText("180만원")).toBeInTheDocument();
  });

  it("다음 버튼을 누르면 목표 선택 페이지로 이동한다", async () => {
    render(<OnboardingResultPage />);
    fireEvent.click(await screen.findByRole("button", { name: "다음" }));

    expect(push).toHaveBeenCalledWith("/onboarding/goal");
  });
});
