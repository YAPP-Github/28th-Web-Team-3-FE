import { SingleChoiceQuestion } from "../_components/single-choice-question";

const TAX_SAVING_INTEREST_OPTIONS = [
  { label: "거의 없어요", value: "almost-none" },
  { label: "관심은 있지만, 나중에 하고 싶어요.", value: "later" },
  { label: "관심이 많고, 절세 전략이 필요해요", value: "needs-strategy" },
] as const;

export default function InterestOnboardingPage() {
  return (
    <SingleChoiceQuestion
      fieldName="taxSavingInterest"
      nextPath="/onboarding/result"
      options={TAX_SAVING_INTEREST_OPTIONS}
      prevPath="/onboarding/period"
      subtitle="투자 성향을 파악하기 위한 질문이에요."
      title={"절세를 위한 IRP, ISA, 연금저축에\n관심이 있나요?"}
    />
  );
}
