import { z } from "zod";
import { residentialAreaSchema } from "./onboarding-api";

export const MAX_MONTHLY_AMOUNT = 650;
export const MAX_NET_WORTH_AMOUNT = 10_000;

const monthlyAmountSchema = z
  .number()
  .int()
  .min(0, "금액을 입력해주세요.")
  .max(
    MAX_MONTHLY_AMOUNT,
    `금액은 ${MAX_MONTHLY_AMOUNT.toLocaleString("ko-KR")}만원 이하여야 해요.`,
  );

export const onboardingFormSchema = z.object({
  birthDate: z
    .union([z.literal(""), z.iso.date()])
    .refine((value) => value !== "", "입력해주세요."),
  address: z.union([z.literal(""), residentialAreaSchema]),
  monthlySalaryManwon: monthlyAmountSchema,
  monthlySavingManwon: monthlyAmountSchema,
  netWorthManwon: z.number().int().min(0).max(MAX_NET_WORTH_AMOUNT),
  goalPeriodMonths: z.union([z.literal(""), z.number().int().min(3).max(36)]),
});

export type OnboardingFormValues = z.infer<typeof onboardingFormSchema>;
