import { SingleChoiceQuestion } from "../_components/single-choice-question";

const INVESTMENT_EXPERIENCE_OPTIONS = [
  { label: "경험이 없어요", value: "none" },
  { label: "1년 미만이에요", value: "under-one-year" },
  { label: "3년 미만이에요", value: "under-three-years" },
  { label: "5년 미만이에요", value: "under-five-years" },
  { label: "5년 이상이에요", value: "five-years-or-more" },
] as const;

export default function ExperienceOnboardingPage() {
  return (
    <SingleChoiceQuestion
      fieldName="investmentExperience"
      nextPath="/onboarding/risk"
      options={INVESTMENT_EXPERIENCE_OPTIONS}
      prevPath="/onboarding/finance"
      subtitle="경험에 따라 플랜의 난이도가 달라져요."
      title={"주식, 펀드 등의 금융투자\n경험이 있나요?"}
    />
  );
}
