import { z } from "zod";

export const MAX_MONTHLY_AMOUNT = 9_999_999;
export const MAX_NET_WORTH_AMOUNT = "999999999999999";

const choiceSchema = <const T extends readonly [string, ...string[]]>(values: T) =>
  z.union([z.literal(""), z.enum(values)]).refine((value) => value !== "", "선택해주세요.");

const monthlyAmountSchema = z
  .number()
  .int()
  .min(1, "금액을 입력해주세요.")
  .max(MAX_MONTHLY_AMOUNT, `금액은 ${MAX_MONTHLY_AMOUNT.toLocaleString()}만원 이하여야 해요.`);

export const onboardingFormSchema = z.object({
  ageGroup: choiceSchema([
    "teens",
    "twenties",
    "thirties",
    "forties",
    "fifties",
    "sixties-or-older",
  ]),
  income: monthlyAmountSchema,
  financialAssetRatio: choiceSchema([
    "almost-none",
    "up-to-half",
    "about-half",
    "more-than-half",
    "almost-all",
  ]),
  investmentExperience: choiceSchema([
    "none",
    "under-one-year",
    "under-three-years",
    "under-five-years",
    "five-years-or-more",
  ]),
  investmentPeriod: choiceSchema([
    "about-six-months",
    "about-one-year",
    "about-one-and-a-half-years",
    "about-two-years",
    "about-two-and-a-half-years",
    "about-three-years",
  ]),
  lossTolerance: choiceSchema([
    "up-to-ten-percent",
    "up-to-twenty-percent",
    "up-to-fifty-percent",
    "up-to-seventy-percent",
    "total-loss",
  ]),
  savings: monthlyAmountSchema,
  netWorth: z
    .string()
    .regex(/^\d+$/, "금액을 입력해주세요.")
    .refine((value) => BigInt(value) > 0n, "금액을 입력해주세요.")
    .refine(
      (value) => BigInt(value) <= BigInt(MAX_NET_WORTH_AMOUNT),
      `금액은 ${BigInt(MAX_NET_WORTH_AMOUNT).toLocaleString()}만원 이하여야 해요.`,
    ),
  riskPreference: choiceSchema([
    "capital-preservation-required",
    "capital-preservation-focused",
    "capital-preservation-preferred",
    "investment-return-preferred",
  ]),
  taxSavingInterest: choiceSchema(["almost-none", "later", "needs-strategy"]),
});

export type OnboardingFormValues = z.infer<typeof onboardingFormSchema>;
