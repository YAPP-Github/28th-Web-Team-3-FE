import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { OnboardingFormProvider } from "../_components/onboarding-form-provider";
import AgeOnboardingPage from "./page";

const push = vi.fn();

vi.mock("next/navigation", () => ({ useRouter: () => ({ push }) }));

function renderPage() {
  return render(
    <OnboardingFormProvider>
      <AgeOnboardingPage />
    </OnboardingFormProvider>,
  );
}

describe("AgeOnboardingPage", () => {
  beforeEach(() => {
    push.mockClear();
  });

  it("선택 전에는 다음 버튼이 비활성화된다", () => {
    renderPage();

    expect(screen.getByRole("button", { name: "다음" })).toBeDisabled();
  });

  it("연령대를 선택하면 다음 버튼이 활성화되고 다음 단계로 이동한다", async () => {
    renderPage();

    fireEvent.click(screen.getByRole("button", { name: "20대" }));

    const nextButton = screen.getByRole("button", { name: "다음" });
    expect(nextButton).toBeEnabled();
    expect(screen.getByRole("button", { name: "20대" })).toHaveAttribute("data-state", "on");

    fireEvent.click(nextButton);

    await waitFor(() => expect(push).toHaveBeenCalledWith("/onboarding/month"));
  });

  it("다른 연령대를 선택하면 기존 선택은 해제된다", () => {
    renderPage();

    fireEvent.click(screen.getByRole("button", { name: "20대" }));
    fireEvent.click(screen.getByRole("button", { name: "30대" }));

    expect(screen.getByRole("button", { name: "20대" })).toHaveAttribute("data-state", "off");
    expect(screen.getByRole("button", { name: "30대" })).toHaveAttribute("data-state", "on");
  });

  it("모든 선택을 해제하면 다음 버튼이 다시 비활성화된다", () => {
    renderPage();

    const ageToggle = screen.getByRole("button", { name: "30대" });
    fireEvent.click(ageToggle);
    fireEvent.click(ageToggle);

    expect(screen.getByRole("button", { name: "다음" })).toBeDisabled();
  });
});
