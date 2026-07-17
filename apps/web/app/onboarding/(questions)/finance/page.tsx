import { SingleChoiceQuestion } from "../_components/single-choice-question";

const FINANCIAL_ASSET_RATIO_OPTIONS = [
  { label: "거의 없어요", value: "almost-none" },
  { label: "절반 이하예요", value: "up-to-half" },
  { label: "절반 정도예요", value: "about-half" },
  { label: "절반 이상이에요", value: "more-than-half" },
  { label: "거의 전부예요", value: "almost-all" },
] as const;

export default function FinanceOnboardingPage() {
  return (
    <SingleChoiceQuestion
      fieldName="financialAssetRatio"
      nextPath="/onboarding/experience"
      options={FINANCIAL_ASSET_RATIO_OPTIONS}
      prevPath="/onboarding/net"
      subtitle="투자 가능한 자산 규모에 따라 적정 비율이 달라져요."
      title={"자산 중 예금, 펀드 등의\n금융자산은 어느 정도인가요?"}
    />
  );
}
