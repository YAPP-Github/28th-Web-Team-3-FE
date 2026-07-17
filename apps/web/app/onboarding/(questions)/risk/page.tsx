import { SingleChoiceQuestion } from "../_components/single-choice-question";

const RISK_PREFERENCE_OPTIONS = [
  { label: "원금 보존이 필수예요", value: "capital-preservation-required" },
  { label: "원금 보존을 추구해요", value: "capital-preservation-focused" },
  { label: "투자 수익보다 원금 보존을 선호해요", value: "capital-preservation-preferred" },
  { label: "투자 수익을 좀 더 선호해요", value: "investment-return-preferred" },
] as const;

export default function RiskOnboardingPage() {
  return (
    <SingleChoiceQuestion
      fieldName="riskPreference"
      nextPath="/onboarding/loss"
      options={RISK_PREFERENCE_OPTIONS}
      prevPath="/onboarding/experience"
      subtitle="투자 성향을 파악하기 위한 질문이에요."
      title={"현재 투자자금의 위험도는\n어느 정도 고려하나요?"}
    />
  );
}
