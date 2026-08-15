import type { OnboardingProfile } from "@repo/schema/onboarding-api";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { SAVE_FAILED_TEXT } from "@/lib/messages";
import { fireEvent, render, screen, waitFor } from "@/lib/test/react";
import ProfileEditPage from "./page";

const navigation = vi.hoisted(() => ({ back: vi.fn(), replace: vi.fn() }));

const PROFILE: OnboardingProfile = {
  status: "COMPLETED",
  birthDate: "2002-10-24",
  address: "SEOUL",
  monthlySalaryManwon: 500,
  monthlySavingManwon: 100,
  netWorthManwon: 5000,
  goalPeriodMonths: 24,
};

vi.mock("next/navigation", () => ({ useRouter: () => navigation }));

vi.mock("@/api/onboarding", () => ({
  confirmOnboardingGoal: vi.fn(),
  getOnboardingGoalPlans: vi.fn(),
  getOnboardingProfile: vi.fn(),
  getOnboardingReport: vi.fn(),
  patchOnboardingProfile: vi.fn(),
  updateOnboardingProfile: vi.fn(),
}));

vi.mock("@/api/goal", () => ({
  fetchGoalStatus: vi.fn(),
  updateGoal: vi.fn(),
  updateSavings: vi.fn(),
}));

import { updateGoal } from "@/api/goal";
import {
  getOnboardingProfile,
  patchOnboardingProfile,
  updateOnboardingProfile,
} from "@/api/onboarding";

describe("ProfileEditPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getOnboardingProfile).mockResolvedValue(PROFILE);
    vi.mocked(patchOnboardingProfile).mockResolvedValue(PROFILE);
    vi.mocked(updateOnboardingProfile).mockResolvedValue(PROFILE);
  });

  it("프로필을 채워 보여주고 변경한 전체 정보와 목표 기간을 저장한다", async () => {
    render(<ProfileEditPage />);

    expect(await screen.findByRole("textbox", { name: "생년월일" })).toHaveValue("2002.10.24");
    expect(screen.getByRole("textbox", { name: "월급" })).toHaveValue("500");
    expect(screen.getByRole("textbox", { name: "월 저축액" })).toHaveValue("100");
    expect(screen.getByRole("textbox", { name: "현재 순자산" })).toHaveValue("5000");
    expect(screen.getByRole("button", { name: "2년 미만" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );

    fireEvent.change(screen.getByRole("textbox", { name: "월급" }), {
      target: { value: "550" },
    });
    fireEvent.change(screen.getByRole("textbox", { name: "월 저축액" }), {
      target: { value: "120" },
    });
    fireEvent.change(screen.getByRole("textbox", { name: "현재 순자산" }), {
      target: { value: "6000" },
    });
    fireEvent.click(screen.getByRole("button", { name: "3년 미만" }));
    fireEvent.click(screen.getByRole("button", { name: "완료" }));

    await waitFor(() =>
      expect(updateOnboardingProfile).toHaveBeenCalledWith({
        birthDate: "2002-10-24",
        monthlySalaryManwon: 550,
        monthlySavingManwon: 120,
        netWorthManwon: 6000,
        goalPeriodMonths: 36,
      }),
    );
    expect(patchOnboardingProfile).not.toHaveBeenCalled();
    expect(updateGoal).not.toHaveBeenCalled();
    expect(navigation.back).toHaveBeenCalledOnce();
  });

  it("목표 기간을 바꾸지 않아도 완료 사용자용 PUT으로 저장한다", async () => {
    render(<ProfileEditPage />);

    await screen.findByRole("textbox", { name: "생년월일" });
    fireEvent.click(screen.getByRole("button", { name: "완료" }));

    await waitFor(() => expect(updateOnboardingProfile).toHaveBeenCalledOnce());
    expect(patchOnboardingProfile).not.toHaveBeenCalled();
    expect(updateGoal).not.toHaveBeenCalled();
  });

  it("월 저축액이 월급보다 크면 저장하지 않는다", async () => {
    render(<ProfileEditPage />);

    const savings = await screen.findByRole("textbox", { name: "월 저축액" });
    fireEvent.change(savings, { target: { value: "600" } });
    fireEvent.click(screen.getByRole("button", { name: "완료" }));

    expect(screen.getByText("월 저축액은 월급보다 클 수 없어요.")).toBeInTheDocument();
    expect(updateOnboardingProfile).not.toHaveBeenCalled();
    expect(updateGoal).not.toHaveBeenCalled();
  });

  it("순자산 빈칸을 0으로 저장하지 않는다", async () => {
    render(<ProfileEditPage />);

    const netWorth = await screen.findByRole("textbox", { name: "현재 순자산" });
    fireEvent.change(netWorth, { target: { value: "" } });
    fireEvent.click(screen.getByRole("button", { name: "완료" }));

    expect(screen.getByText("현재 순자산을 입력해주세요.")).toBeInTheDocument();
    expect(updateOnboardingProfile).not.toHaveBeenCalled();
  });

  it("저장 실패를 안내하고 화면에 남는다", async () => {
    vi.mocked(updateOnboardingProfile).mockRejectedValue(new Error("network error"));
    render(<ProfileEditPage />);

    await screen.findByRole("textbox", { name: "생년월일" });
    fireEvent.click(screen.getByRole("button", { name: "완료" }));

    expect(await screen.findByText(SAVE_FAILED_TEXT)).toBeInTheDocument();
    expect(navigation.back).not.toHaveBeenCalled();
  });

  it("PUT 저장 실패 후 완료를 다시 누르면 전체 profile을 재시도한다", async () => {
    vi.mocked(updateOnboardingProfile)
      .mockRejectedValueOnce(new Error("network error"))
      .mockResolvedValueOnce({ ...PROFILE, goalPeriodMonths: 36 });
    render(<ProfileEditPage />);

    await screen.findByRole("textbox", { name: "생년월일" });
    fireEvent.click(screen.getByRole("button", { name: "3년 미만" }));
    fireEvent.click(screen.getByRole("button", { name: "완료" }));
    expect(await screen.findByText(SAVE_FAILED_TEXT)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "완료" }));

    await waitFor(() => expect(updateOnboardingProfile).toHaveBeenCalledTimes(2));
    expect(updateGoal).not.toHaveBeenCalled();
    expect(navigation.back).toHaveBeenCalledOnce();
  });
});
