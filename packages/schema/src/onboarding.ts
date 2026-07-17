import { z } from "zod";

export const MAX_MONTHLY_AMOUNT = 9_999_999;
export const MAX_NET_WORTH_AMOUNT = "9999999999999999999";

const monthlyAmountSchema = z
  .number()
  .int()
  .min(1, "금액을 입력해주세요.")
  .max(MAX_MONTHLY_AMOUNT, `금액은 ${MAX_MONTHLY_AMOUNT.toLocaleString()}만원 이하여야 해요.`);

export const onboardingFormSchema = z.object({
  income: monthlyAmountSchema,
  savings: monthlyAmountSchema,
  netWorth: z
    .string()
    .regex(/^\d+$/, "금액을 입력해주세요.")
    .refine((value) => BigInt(value) > 0n, "금액을 입력해주세요.")
    .refine(
      (value) => BigInt(value) <= BigInt(MAX_NET_WORTH_AMOUNT),
      `금액은 ${BigInt(MAX_NET_WORTH_AMOUNT).toLocaleString()}만원 이하여야 해요.`,
    ),
});

export type OnboardingFormValues = z.infer<typeof onboardingFormSchema>;
