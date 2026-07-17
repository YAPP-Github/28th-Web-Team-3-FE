import { SingleChoiceQuestion } from "../_components/single-choice-question";

const INVESTMENT_PERIOD_OPTIONS = [
  { label: "6개월 정도 예상해요", value: "about-six-months" },
  { label: "1년 정도 예상해요", value: "about-one-year" },
  { label: "1년 6개월 정도 예상해요", value: "about-one-and-a-half-years" },
  { label: "2년 정도 예상해요", value: "about-two-years" },
  { label: "2년 6개월 정도 예상해요", value: "about-two-and-a-half-years" },
  { label: "3년 정도 예상해요", value: "about-three-years" },
] as const;

export default function PeriodOnboardingPage() {
  return (
    <SingleChoiceQuestion
      fieldName="investmentPeriod"
      nextPath="/onboarding/interest"
      options={INVESTMENT_PERIOD_OPTIONS}
      prevPath="/onboarding/loss"
      subtitle="투자 성향을 파악하기 위한 질문이에요."
      title={"현재 투자자금의 예상 투자 기간은\n얼마나 되나요?"}
    />
  );
}
