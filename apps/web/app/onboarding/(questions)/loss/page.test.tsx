import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { OnboardingFormProvider } from "../_components/onboarding-form-provider";
import LossOnboardingPage from "./page";

const push = vi.fn();

vi.mock("next/navigation", () => ({ useRouter: () => ({ prefetch: vi.fn(), push }) }));

describe("LossOnboardingPage", () => {
  beforeEach(() => {
    push.mockClear();
  });

  it("선택한 손실 감내도로 이전과 다음 질문 사이를 이동한다", async () => {
    render(
      <OnboardingFormProvider>
        <LossOnboardingPage />
      </OnboardingFormProvider>,
    );

    fireEvent.click(screen.getByRole("radio", { name: "20%까진 괜찮아요" }));
    fireEvent.click(screen.getByRole("button", { name: "다음" }));
    await waitFor(() => expect(push).toHaveBeenCalledWith("/onboarding/period"));

    fireEvent.click(screen.getByRole("button", { name: "이전" }));
    expect(push).toHaveBeenCalledWith("/onboarding/risk");
  });
});
