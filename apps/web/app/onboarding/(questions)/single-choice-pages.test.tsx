import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import type { ComponentType } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { OnboardingFormProvider } from "./_components/onboarding-form-provider";
import InvestmentExperienceOnboardingPage from "./experience/page";
import FinancialAssetsOnboardingPage from "./finance/page";
import TaxSavingInterestOnboardingPage from "./interest/page";
import LossToleranceOnboardingPage from "./loss/page";
import InvestmentPeriodOnboardingPage from "./period/page";
import InvestmentRiskPreferenceOnboardingPage from "./risk/page";

const pushMock = vi.fn();

vi.mock("next/navigation", () => ({ useRouter: () => ({ prefetch: vi.fn(), push: pushMock }) }));

const SINGLE_CHOICE_QUESTION_PAGE_TEST_CASES: Array<{
  accessibleQuestionTitle: string;
  expectedNextQuestionPath: string;
  expectedPreviousQuestionPath: string;
  QuestionPageComponent: ComponentType;
  selectionLabel: string;
}> = [
  {
    accessibleQuestionTitle: "자산 중 예금, 펀드 등의 금융자산은 어느 정도인가요?",
    expectedNextQuestionPath: "/onboarding/experience",
    expectedPreviousQuestionPath: "/onboarding/net",
    QuestionPageComponent: FinancialAssetsOnboardingPage,
    selectionLabel: "절반 정도예요",
  },
  {
    accessibleQuestionTitle: "주식, 펀드 등의 금융투자 경험이 있나요?",
    expectedNextQuestionPath: "/onboarding/risk",
    expectedPreviousQuestionPath: "/onboarding/finance",
    QuestionPageComponent: InvestmentExperienceOnboardingPage,
    selectionLabel: "3년 미만이에요",
  },
  {
    accessibleQuestionTitle: "현재 투자자금의 위험도는 어느 정도 고려하나요?",
    expectedNextQuestionPath: "/onboarding/loss",
    expectedPreviousQuestionPath: "/onboarding/experience",
    QuestionPageComponent: InvestmentRiskPreferenceOnboardingPage,
    selectionLabel: "원금 보존을 추구해요",
  },
  {
    accessibleQuestionTitle: "현재 투자자금의 손실을 어느 정도 견딜 수 있나요?",
    expectedNextQuestionPath: "/onboarding/period",
    expectedPreviousQuestionPath: "/onboarding/risk",
    QuestionPageComponent: LossToleranceOnboardingPage,
    selectionLabel: "20%까진 괜찮아요",
  },
  {
    accessibleQuestionTitle: "현재 투자자금의 예상 투자 기간은 얼마나 되나요?",
    expectedNextQuestionPath: "/onboarding/interest",
    expectedPreviousQuestionPath: "/onboarding/loss",
    QuestionPageComponent: InvestmentPeriodOnboardingPage,
    selectionLabel: "2년 정도 예상해요",
  },
  {
    accessibleQuestionTitle: "절세를 위한 IRP, ISA, 연금저축에 관심이 있나요?",
    expectedNextQuestionPath: "/onboarding/result",
    expectedPreviousQuestionPath: "/onboarding/period",
    QuestionPageComponent: TaxSavingInterestOnboardingPage,
    selectionLabel: "관심이 많고, 절세 전략이 필요해요",
  },
];

describe("single choice onboarding pages", () => {
  beforeEach(() => {
    pushMock.mockClear();
  });

  it.each(
    SINGLE_CHOICE_QUESTION_PAGE_TEST_CASES,
  )("$accessibleQuestionTitle 페이지는 선택값으로 이전과 다음 질문 사이를 이동한다", async ({
    accessibleQuestionTitle,
    expectedNextQuestionPath,
    expectedPreviousQuestionPath,
    QuestionPageComponent,
    selectionLabel,
  }) => {
    render(
      <OnboardingFormProvider>
        <QuestionPageComponent />
      </OnboardingFormProvider>,
    );

    const nextButton = screen.getByRole("button", { name: "다음" });
    expect(screen.getByRole("radiogroup", { name: accessibleQuestionTitle })).toBeInTheDocument();
    expect(nextButton).toBeDisabled();

    fireEvent.click(screen.getByRole("radio", { name: selectionLabel }));
    expect(nextButton).toBeEnabled();

    fireEvent.click(nextButton);
    await waitFor(() => expect(pushMock).toHaveBeenCalledWith(expectedNextQuestionPath));

    fireEvent.click(screen.getByRole("button", { name: "이전" }));
    expect(pushMock).toHaveBeenCalledWith(expectedPreviousQuestionPath);
  });
});
