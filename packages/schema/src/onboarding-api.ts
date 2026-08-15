import { z } from "zod";

export const onboardingStatusSchema = z.enum(["IN_PROGRESS", "COMPLETED"]);

export const residentialAreaSchema = z.enum([
  "SEOUL",
  "GYEONGGI",
  "INCHEON",
  "BUSAN",
  "DAEGU",
  "DAEJEON",
  "SEJONG",
  "ULSAN",
  "CHUNGNAM",
  "CHUNGBUK",
  "GYEONGNAM",
  "GYEONGBUK",
  "JEONNAM",
  "JEONBUK",
  "GANGWON",
  "JEJU",
]);

export const onboardingProfilePatchSchema = z.object({
  birthDate: z.iso.date().optional(),
  address: residentialAreaSchema.optional(),
  monthlySalaryManwon: z.number().int().min(0).max(650).optional(),
  monthlySavingManwon: z.number().int().min(0).max(650).optional(),
  netWorthManwon: z.number().int().min(0).max(10_000).optional(),
  goalPeriodMonths: z.number().int().min(3).max(36).optional(),
});

export const onboardingProfileSchema = onboardingProfilePatchSchema.extend({
  status: onboardingStatusSchema,
  birthDate: z.iso.date().nullable(),
  address: residentialAreaSchema.nullable(),
  monthlySalaryManwon: z.number().int().nullable(),
  monthlySavingManwon: z.number().int().nullable(),
  netWorthManwon: z.number().int().nullable(),
  goalPeriodMonths: z.number().int().nullable(),
});

const histogramSeriesSchema = z.object({
  bins: z.array(
    z.object({
      lowerManwon: z.number().int(),
      upperManwon: z.number().int().nullable(),
      ratio: z.number(),
      density: z.number(),
    }),
  ),
  markerManwon: z.number().int(),
});

export const onboardingReportSchema = z.object({
  simulation: z.object({
    baselineManwon: z.number().int(),
    simulationManwon: z.number().int(),
    diffManwon: z.number().int(),
    upliftPercent: z.number().int(),
    periodMonths: z.number().int(),
  }),
  peer: z.object({
    assetRatioPercent: z.number().int(),
    incomeTopPercent: z.number().int(),
    consumptionTopPercent: z.number().int(),
  }),
  histogram: z.object({
    income: histogramSeriesSchema,
    consumption: histogramSeriesSchema,
  }),
  diagnosis: z.object({
    branchCode: z.number().int(),
    message: z.string(),
  }),
  disclaimer: z.string(),
  datasetVersion: z.string(),
  configVersion: z.string(),
});

export const goalPlanSchema = z.enum(["PLAN_1", "PLAN_2"]);

const checkpointSchema = z.object({
  month: z.number().int(),
  amountManwon: z.number().int(),
});

export const onboardingGoalPlansSchema = z.object({
  monthlySavingManwon: z.number().int(),
  periodMonths: z.number().int(),
  plans: z.array(
    z.object({
      plan: goalPlanSchema,
      label: z.string(),
      default: z.boolean(),
      increaseMinManwon: z.number().int(),
      increaseMaxManwon: z.number().int(),
      checkpoints: z.array(checkpointSchema),
      card: checkpointSchema,
    }),
  ),
});

export const onboardingGoalConfirmSchema = z.object({ plan: goalPlanSchema });

export const onboardingGoalSchema = z.object({
  goalId: z.number().int(),
  plan: goalPlanSchema,
  periodMonths: z.number().int(),
  targetAmountManwon: z.number().int(),
  status: z.literal("COMPLETED"),
});

export type OnboardingProfilePatch = z.infer<typeof onboardingProfilePatchSchema>;
export type OnboardingProfile = z.infer<typeof onboardingProfileSchema>;
export type ResidentialArea = z.infer<typeof residentialAreaSchema>;
export type OnboardingReport = z.infer<typeof onboardingReportSchema>;
export type OnboardingGoalPlans = z.infer<typeof onboardingGoalPlansSchema>;
export type OnboardingGoalConfirm = z.infer<typeof onboardingGoalConfirmSchema>;
export type OnboardingGoal = z.infer<typeof onboardingGoalSchema>;
