"use client";

import { Button, Progress } from "@repo/ui";
import { ChevronLeft } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { ONBOARDING_QUESTION_STEPS } from "@/app/onboarding/constants/question-steps";
import {
  getOnboardingQuestionStepIndex,
  getPreviousOnboardingQuestionPath,
} from "@/app/onboarding/lib/question-navigation";

export function QuestionHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const questionStepIndex = getOnboardingQuestionStepIndex(pathname);
  const currentQuestionStep =
    questionStepIndex < 0 ? undefined : ONBOARDING_QUESTION_STEPS[questionStepIndex];
  const progressValue =
    questionStepIndex < 0 ? 0 : ((questionStepIndex + 1) / ONBOARDING_QUESTION_STEPS.length) * 100;
  const previousQuestionPath = currentQuestionStep
    ? getPreviousOnboardingQuestionPath(currentQuestionStep)
    : "/onboarding/intro";

  return (
    <header>
      <div className="flex h-11 items-center justify-between">
        <Button
          aria-label="이전 단계"
          size="icon"
          variant="ghost"
          onClick={() => router.replace(previousQuestionPath)}
        >
          <ChevronLeft aria-hidden="true" className="size-6" strokeWidth="1.6" />
        </Button>
        <div aria-hidden="true" className="size-11" />
      </div>
      <div className="mt-2 px-5">
        <Progress aria-label="온보딩 진행률" value={progressValue} />
      </div>
    </header>
  );
}
