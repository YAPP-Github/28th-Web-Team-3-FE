import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { OnboardingFormProvider } from "../_components/onboarding-form-provider";
import InterestOnboardingPage from "./page";

const push = vi.fn();

vi.mock("next/navigation", () => ({ useRouter: () => ({ prefetch: vi.fn(), push }) }));

describe("InterestOnboardingPage", () => {
  beforeEach(() => {
    push.mockClear();
  });

  it("선택 후 결과 페이지로 이동한다", async () => {
    render(
      <OnboardingFormProvider>
        <InterestOnboardingPage />
      </OnboardingFormProvider>,
    );

    fireEvent.click(screen.getByRole("radio", { name: "관심이 많고, 절세 전략이 필요해요" }));
    fireEvent.click(screen.getByRole("button", { name: "다음" }));

    await waitFor(() => expect(push).toHaveBeenCalledWith("/onboarding/result"));
  });
});
