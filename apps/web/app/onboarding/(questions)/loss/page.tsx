import { SingleChoiceQuestion } from "../_components/single-choice-question";

const LOSS_TOLERANCE_OPTIONS = [
  { label: "10%까진 괜찮아요", value: "up-to-ten-percent" },
  { label: "20%까진 괜찮아요", value: "up-to-twenty-percent" },
  { label: "50%까진 괜찮아요", value: "up-to-fifty-percent" },
  { label: "70%까진 괜찮아요", value: "up-to-seventy-percent" },
  { label: "전액 손실도 견딜 수 있어요", value: "total-loss" },
] as const;

export default function LossOnboardingPage() {
  return (
    <SingleChoiceQuestion
      fieldName="lossTolerance"
      nextPath="/onboarding/period"
      options={LOSS_TOLERANCE_OPTIONS}
      prevPath="/onboarding/risk"
      subtitle="투자 성향을 파악하기 위한 질문이에요."
      title={"현재 투자자금의 손실을\n어느 정도 견딜 수 있나요?"}
    />
  );
}
