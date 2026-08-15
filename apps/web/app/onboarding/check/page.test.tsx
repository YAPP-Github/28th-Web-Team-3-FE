import { beforeEach, describe, expect, it, vi } from "vitest";
import { getOnboardingProfile } from "@/api/onboarding";
import { fireEvent, render, screen } from "@/lib/test/react";
import OnboardingCheckPage from "./page";

const push = vi.fn();

vi.mock("next/navigation", () => ({ useRouter: () => ({ push }) }));
vi.mock("@/api/onboarding", () => ({ getOnboardingProfile: vi.fn() }));

const profile = {
  status: "IN_PROGRESS" as const,
  birthDate: "2002-10-24",
  address: "GYEONGGI" as const,
  monthlySalaryManwon: 500,
  monthlySavingManwon: 100,
  netWorthManwon: 2_000,
  goalPeriodMonths: 36,
};

describe("OnboardingCheckPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getOnboardingProfile).mockResolvedValue(profile);
  });

  it("저장된 설문 응답을 읽기 전용으로 표시한다", async () => {
    render(<OnboardingCheckPage />);

    expect(await screen.findByLabelText("생년월일이 어떻게 되시나요?")).toHaveValue("2002.10.24");
    expect(screen.getByLabelText("거주지역이 어디이신가요?")).toHaveValue("경기");
    expect(screen.getByLabelText("월급은 어느 정도인가요?")).toHaveValue("500만원");
    expect(screen.getByLabelText("월 저축액은 어느 정도인가요?")).toHaveValue("100만원");
    expect(screen.getByLabelText("현재 순자산은 어느 정도 인가요?")).toHaveValue("2,000만원");
    expect(
      screen.getByLabelText("서비스를 사용하여 자산을 모으고 싶은 기간을 입력해주세요."),
    ).toHaveValue("3년");
    expect(screen.getAllByRole("textbox")).toHaveLength(6);
    for (const input of screen.getAllByRole("textbox")) {
      expect(input).toHaveAttribute("readonly");
      expect(input).not.toBeDisabled();
    }
  });

  it("이전과 완료 버튼으로 온보딩 흐름을 이동한다", async () => {
    render(<OnboardingCheckPage />);

    fireEvent.click(await screen.findByRole("button", { name: "이전" }));
    expect(push).toHaveBeenCalledWith("/onboarding/period");

    fireEvent.click(screen.getByRole("button", { name: "완료" }));
    expect(push).toHaveBeenCalledWith("/onboarding/result");
  });

  it("빠진 응답이 있으면 결과로 진행하지 못한다", async () => {
    vi.mocked(getOnboardingProfile).mockResolvedValue({ ...profile, birthDate: null });

    render(<OnboardingCheckPage />);

    expect(await screen.findByRole("button", { name: "완료" })).toBeDisabled();
    expect(screen.getByLabelText("생년월일이 어떻게 되시나요?")).toHaveValue("입력되지 않음");
  });
});
