import { beforeEach, describe, expect, it, vi } from "vitest";
import { getOnboardingProfile, patchOnboardingProfile } from "@/api/onboarding";
import { OnboardingFormProvider } from "@/app/onboarding/(questions)/_components/onboarding-form-provider";
import { fireEvent, render, screen, waitFor } from "@/lib/test/react";
import NetWorthOnboardingPage from "./page";

const pushMock = vi.fn();

vi.mock("next/navigation", () => ({ useRouter: () => ({ push: pushMock }) }));
vi.mock("@/api/onboarding", () => ({
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
    vi.mocked(getOnboardingProfile).mockRejectedValue(new Error("test"));
  });

  it("금액을 입력하기 전에는 다음 버튼이 비활성화된다", () => {
    renderNetWorthOnboardingPage();

    expect(screen.getByRole("button", { name: "다음" })).toBeDisabled();
  });

  it("저장된 순자산을 복원하면 다시 입력하지 않아도 다음으로 갈 수 있다", async () => {
    vi.mocked(getOnboardingProfile).mockResolvedValue({
      status: "IN_PROGRESS",
      birthDate: "1998-03-01",
      monthlySalaryManwon: 300,
      monthlySavingManwon: 100,
      netWorthManwon: 0,
      goalPeriodMonths: null,
    });

    renderNetWorthOnboardingPage();

    await waitFor(() => expect(screen.getByRole("button", { name: "다음" })).toBeEnabled());
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

  it("순자산 0도 유효한 답변이라 다음으로 넘어간다", async () => {
    renderNetWorthOnboardingPage();

    fireEvent.click(screen.getByRole("button", { name: "직접 입력" }));
    fireEvent.change(screen.getByRole("textbox", { name: "순자산만원" }), {
      target: { value: "0" },
    });
    fireEvent.click(screen.getByRole("button", { name: "완료" }));
    fireEvent.click(screen.getByRole("button", { name: "다음" }));

    await waitFor(() => expect(pushMock).toHaveBeenCalledWith("/onboarding/period"));
    expect(patchOnboardingProfile).toHaveBeenCalledWith({ netWorthManwon: 0 });
  });

  it("이전 버튼이 월급 질문 경로로 이동한다", () => {
    renderNetWorthOnboardingPage();

    fireEvent.click(screen.getByRole("button", { name: "이전" }));
    expect(pushMock).toHaveBeenCalledWith("/onboarding/month");
  });
});
