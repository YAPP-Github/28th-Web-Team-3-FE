import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { OnboardingFormProvider } from "../_components/onboarding-form-provider";
import RiskOnboardingPage from "./page";

const push = vi.fn();

vi.mock("next/navigation", () => ({ useRouter: () => ({ prefetch: vi.fn(), push }) }));

describe("RiskOnboardingPage", () => {
  beforeEach(() => {
    push.mockClear();
  });

  it("선택한 위험 선호도로 이전과 다음 질문 사이를 이동한다", async () => {
    render(
      <OnboardingFormProvider>
        <RiskOnboardingPage />
      </OnboardingFormProvider>,
    );

    fireEvent.click(screen.getByRole("radio", { name: "원금 보존을 추구해요" }));
    fireEvent.click(screen.getByRole("button", { name: "다음" }));
    await waitFor(() => expect(push).toHaveBeenCalledWith("/onboarding/loss"));

    fireEvent.click(screen.getByRole("button", { name: "이전" }));
    expect(push).toHaveBeenCalledWith("/onboarding/experience");
  });
});
