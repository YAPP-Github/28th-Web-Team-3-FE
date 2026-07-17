"use client";

import { Button, Progress } from "@repo/ui";
import { ChevronLeft } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { QUESTION_STEPS } from "../constants/question-steps";
import { getPreviousQuestionPath, getQuestionStepIndex } from "../lib/question-navigation";

export function QuestionHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const stepIndex = getQuestionStepIndex(pathname);
  const currentStep = stepIndex < 0 ? undefined : QUESTION_STEPS[stepIndex];
  const progress = stepIndex < 0 ? 0 : ((stepIndex + 1) / QUESTION_STEPS.length) * 100;
  const previousPath = currentStep ? getPreviousQuestionPath(currentStep) : "/onboarding/intro";

  return (
    <header>
      <div className="flex h-11 items-center justify-between">
        <Button
          aria-label="이전 단계"
          size="icon"
          variant="ghost"
          onClick={() => router.push(previousPath)}
        >
          <ChevronLeft className="size-6" strokeWidth="1.6" />
        </Button>
        <div aria-hidden="true" className="size-11" />
      </div>
      <div className="mt-2 px-5">
        <Progress aria-label="온보딩 진행률" value={progress} />
      </div>
    </header>
  );
}
