import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { OnboardingFormProvider } from "@/app/onboarding/(questions)/_components/onboarding-form-provider";
import { patchOnboardingProfile } from "@/lib/onboarding-api";
import NetWorthOnboardingPage from "./page";

const pushMock = vi.fn();

vi.mock("next/navigation", () => ({ useRouter: () => ({ push: pushMock }) }));
vi.mock("@/lib/onboarding-api", () => ({
  getOnboardingProfile: vi.fn().mockRejectedValue(new Error("test")),
  patchOnboardingProfile: vi.fn().mockResolvedValue({}),
}));

function renderNetWorthOnboardingPage() {
  return render(
    <OnboardingFormProvider>
      <NetWorthOnboardingPage />
    </OnboardingFormProvider>,
  );
}

describe("NetWorthOnboardingPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("금액을 입력하기 전에는 다음 버튼이 비활성화된다", () => {
    renderNetWorthOnboardingPage();

    expect(screen.getByRole("button", { name: "다음" })).toBeDisabled();
  });

  it("한도 초과 직접 입력은 최대값으로 제한한다", () => {
    renderNetWorthOnboardingPage();

    fireEvent.click(screen.getByRole("button", { name: "직접 입력" }));
    fireEvent.change(screen.getByRole("textbox", { name: "순자산만원" }), {
      target: { value: "10001" },
    });

    expect(screen.getByRole("textbox", { name: "순자산만원" })).toHaveValue("10000");
  });

  it("입력한 순자산으로 다음 질문으로 이동한다", async () => {
    renderNetWorthOnboardingPage();

    fireEvent.click(screen.getByRole("button", { name: "직접 입력" }));
    fireEvent.change(screen.getByRole("textbox", { name: "순자산만원" }), {
      target: { value: "10000" },
    });
    fireEvent.click(screen.getByRole("button", { name: "완료" }));
    fireEvent.click(screen.getByRole("button", { name: "다음" }));

    await waitFor(() => expect(pushMock).toHaveBeenCalledWith("/onboarding/period"));
    expect(patchOnboardingProfile).toHaveBeenCalledWith({ netWorthManwon: 10000 });
  });

  it("이전 버튼이 월급 질문 경로로 이동한다", () => {
    renderNetWorthOnboardingPage();

    fireEvent.click(screen.getByRole("button", { name: "이전" }));
    expect(pushMock).toHaveBeenCalledWith("/onboarding/month");
  });
});
