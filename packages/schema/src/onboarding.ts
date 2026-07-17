import { z } from "zod";

export const MAX_MONTHLY_AMOUNT = 9_999_999;

const monthlyAmountSchema = z
  .number()
  .int()
  .min(1, "금액을 입력해주세요.")
  .max(MAX_MONTHLY_AMOUNT, `금액은 ${MAX_MONTHLY_AMOUNT.toLocaleString()}만원 이하여야 해요.`);

export const onboardingFormSchema = z.object({
  income: monthlyAmountSchema,
  savings: monthlyAmountSchema,
});

export type OnboardingFormValues = z.infer<typeof onboardingFormSchema>;
