import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { OnboardingFormProvider } from "@/app/onboarding/(questions)/_components/onboarding-form-provider";
import { patchOnboardingProfile } from "@/lib/onboarding/api";
import AgeOnboardingPage from "./page";

const pushMock = vi.fn();

vi.mock("next/navigation", () => ({ useRouter: () => ({ prefetch: vi.fn(), push: pushMock }) }));
vi.mock("@/lib/onboarding/api", () => ({
  getOnboardingProfile: vi.fn().mockRejectedValue(new Error("test")),
  patchOnboardingProfile: vi.fn().mockResolvedValue({}),
}));

describe("AgeOnboardingPage", () => {
  beforeEach(() => vi.clearAllMocks());

  it("생년월일을 YYYY.MM.DD로 입력하고 birthDate만 저장한다", async () => {
    render(
      <OnboardingFormProvider>
        <AgeOnboardingPage />
      </OnboardingFormProvider>,
    );

    const input = screen.getByRole("textbox", { name: "생년월일" });
    const nextButton = screen.getByRole("button", { name: "다음" });
    expect(nextButton).toBeDisabled();

    fireEvent.change(input, { target: { value: "19980301" } });
    expect(input).toHaveValue("1998.03.01");
    expect(nextButton).toBeEnabled();
    fireEvent.click(nextButton);

    await waitFor(() => {
      expect(patchOnboardingProfile).toHaveBeenCalledWith({ birthDate: "1998-03-01" });
      expect(pushMock).toHaveBeenCalledWith("/onboarding/month");
    });
  });

  it("존재하지 않는 날짜는 오류를 표시하고 다음을 비활성화한다", () => {
    render(
      <OnboardingFormProvider>
        <AgeOnboardingPage />
      </OnboardingFormProvider>,
    );

    const input = screen.getByRole("textbox", { name: "생년월일" });
    fireEvent.change(input, { target: { value: "19990229" } });

    expect(screen.getByText("올바른 날짜를 입력해주세요.")).toBeInTheDocument();
    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(screen.getByRole("button", { name: "다음" })).toBeDisabled();
    expect(patchOnboardingProfile).not.toHaveBeenCalled();
  });

  it("미래 날짜는 서버에 보내지 않고 오류를 표시한다", () => {
    render(
      <OnboardingFormProvider>
        <AgeOnboardingPage />
      </OnboardingFormProvider>,
    );

    const input = screen.getByRole("textbox", { name: "생년월일" });
    fireEvent.change(input, { target: { value: "20991231" } });

    expect(screen.getByText("오늘 이전 날짜로 입력해주세요.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "다음" })).toBeDisabled();
    expect(patchOnboardingProfile).not.toHaveBeenCalled();
  });

  it("오늘 날짜도 과거가 아니므로 막는다", () => {
    render(
      <OnboardingFormProvider>
        <AgeOnboardingPage />
      </OnboardingFormProvider>,
    );

    const today = new Date();
    const todayDigits = [
      String(today.getFullYear()),
      String(today.getMonth() + 1).padStart(2, "0"),
      String(today.getDate()).padStart(2, "0"),
    ].join("");
    fireEvent.change(screen.getByRole("textbox", { name: "생년월일" }), {
      target: { value: todayDigits },
    });

    expect(screen.getByText("오늘 이전 날짜로 입력해주세요.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "다음" })).toBeDisabled();
  });
});
