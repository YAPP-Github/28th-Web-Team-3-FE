import type { OnboardingGoalPlans } from "@repo/schema/onboarding-api";
import { formatManwon } from "@/lib/format";

type GoalPlan = OnboardingGoalPlans["plans"][number];

export function GoalPlanChart({ plan }: { plan: GoalPlan }) {
  const maxAmount = Math.max(...plan.checkpoints.map((point) => point.amountManwon), 1);

  return (
    <div
      aria-label={`기간별 목표 예상 금액: ${plan.checkpoints
        .map((point) => `${point.month}개월 ${formatManwon(point.amountManwon)}`)
        .join(", ")}`}
      className="flex h-[249px] items-end justify-center gap-[18px]"
      role="img"
    >
      {plan.checkpoints.map((point, index) => {
        const isLast = index === plan.checkpoints.length - 1;
        const height = Math.max(58, Math.round((point.amountManwon / maxAmount) * 181));

        return (
          <div className="flex w-[50px] flex-col items-center gap-[5px]" key={point.month}>
            <span
              className={
                isLast
                  ? "whitespace-nowrap text-body-b1-500 text-gray-700 tabular-nums"
                  : "whitespace-nowrap text-body-b2-500 text-gray-400 tabular-nums"
              }
            >
              {formatManwon(point.amountManwon)}
            </span>
            <div className="flex flex-col items-center gap-[13px]">
              <div
                className={
                  isLast
                    ? "w-[47px] rounded-md bg-gray-700"
                    : "w-[50px] rounded-md bg-gradient-to-b from-gray-200 to-gray-100"
                }
                style={{ height }}
              />
              <span className="whitespace-nowrap text-title-t2-500 text-gray-500 tabular-nums">
                {point.month}개월
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
