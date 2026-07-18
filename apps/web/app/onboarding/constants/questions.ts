import type { OnboardingFormValues } from "@repo/schema";
import type { OnboardingQuestionStep } from "./question-steps";

type SingleChoiceFormFieldName = Extract<
  {
    [FieldName in keyof OnboardingFormValues]: "" extends OnboardingFormValues[FieldName]
      ? FieldName
      : never;
  }[keyof OnboardingFormValues],
  string
>;

type SingleChoiceFormFieldValue<TFieldName extends SingleChoiceFormFieldName> = Exclude<
  OnboardingFormValues[TFieldName],
  ""
>;

type SingleChoiceQuestionDefinition<
  TFieldName extends SingleChoiceFormFieldName = SingleChoiceFormFieldName,
> = {
  formFieldName: TFieldName;
  choices: readonly {
    label: string;
    value: SingleChoiceFormFieldValue<TFieldName>;
  }[];
  description: string;
  questionTitle: string;
};

export type SingleChoiceQuestionStep = Exclude<OnboardingQuestionStep, "age" | "month" | "net">;

export const AGE_GROUP_OPTIONS = [
  { label: "10대", value: "teens" },
  { label: "20대", value: "twenties" },
  { label: "30대", value: "thirties" },
  { label: "40대", value: "forties" },
  { label: "50대", value: "fifties" },
  { label: "60대 이상", value: "sixties-or-older" },
] as const;

export const SINGLE_CHOICE_QUESTION_DEFINITIONS = {
  finance: {
    formFieldName: "financialAssetRatio",
    choices: [
      { label: "거의 없어요", value: "almost-none" },
      { label: "절반 이하예요", value: "up-to-half" },
      { label: "절반 정도예요", value: "about-half" },
      { label: "절반 이상이에요", value: "more-than-half" },
      { label: "거의 전부예요", value: "almost-all" },
    ],
    description: "투자 가능한 자산 규모에 따라 적정 비율이 달라져요.",
    questionTitle: "자산 중 예금, 펀드 등의\n금융자산은 어느 정도인가요?",
  },
  experience: {
    formFieldName: "investmentExperience",
    choices: [
      { label: "경험이 없어요", value: "none" },
      { label: "1년 미만이에요", value: "under-one-year" },
      { label: "3년 미만이에요", value: "under-three-years" },
      { label: "5년 미만이에요", value: "under-five-years" },
      { label: "5년 이상이에요", value: "five-years-or-more" },
    ],
    description: "경험에 따라 플랜의 난이도가 달라져요.",
    questionTitle: "주식, 펀드 등의 금융투자\n경험이 있나요?",
  },
  interest: {
    formFieldName: "taxSavingInterest",
    choices: [
      { label: "거의 없어요", value: "almost-none" },
      { label: "관심은 있지만, 나중에 하고 싶어요.", value: "later" },
      { label: "관심이 많고, 절세 전략이 필요해요", value: "needs-strategy" },
    ],
    description: "투자 성향을 파악하기 위한 질문이에요.",
    questionTitle: "절세를 위한 IRP, ISA, 연금저축에\n관심이 있나요?",
  },
  loss: {
    formFieldName: "lossTolerance",
    choices: [
      { label: "10%까진 괜찮아요", value: "up-to-ten-percent" },
      { label: "20%까진 괜찮아요", value: "up-to-twenty-percent" },
      { label: "50%까진 괜찮아요", value: "up-to-fifty-percent" },
      { label: "70%까진 괜찮아요", value: "up-to-seventy-percent" },
      { label: "전액 손실도 견딜 수 있어요", value: "total-loss" },
    ],
    description: "투자 성향을 파악하기 위한 질문이에요.",
    questionTitle: "현재 투자자금의 손실을\n어느 정도 견딜 수 있나요?",
  },
  period: {
    formFieldName: "investmentPeriod",
    choices: [
      { label: "6개월 정도 예상해요", value: "about-six-months" },
      { label: "1년 정도 예상해요", value: "about-one-year" },
      { label: "1년 6개월 정도 예상해요", value: "about-one-and-a-half-years" },
      { label: "2년 정도 예상해요", value: "about-two-years" },
      { label: "2년 6개월 정도 예상해요", value: "about-two-and-a-half-years" },
      { label: "3년 정도 예상해요", value: "about-three-years" },
    ],
    description: "투자 성향을 파악하기 위한 질문이에요.",
    questionTitle: "현재 투자자금의 예상 투자 기간은\n얼마나 되나요?",
  },
  risk: {
    formFieldName: "riskPreference",
    choices: [
      { label: "원금 보존이 필수예요", value: "capital-preservation-required" },
      { label: "원금 보존을 추구해요", value: "capital-preservation-focused" },
      { label: "투자 수익보다 원금 보존을 선호해요", value: "capital-preservation-preferred" },
      { label: "투자 수익을 좀 더 선호해요", value: "investment-return-preferred" },
    ],
    description: "투자 성향을 파악하기 위한 질문이에요.",
    questionTitle: "현재 투자자금의 위험도는\n어느 정도 고려하나요?",
  },
} satisfies Record<SingleChoiceQuestionStep, SingleChoiceQuestionDefinition>;
