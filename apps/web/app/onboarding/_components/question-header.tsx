"use client";

import { Button, Progress } from "@repo/ui";
import { ChevronLeft } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { getQuestionStepIndex, QUESTION_STEPS } from "./question-steps";

export function QuestionHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const stepIndex = getQuestionStepIndex(pathname);
  const progress = stepIndex < 0 ? 0 : ((stepIndex + 1) / QUESTION_STEPS.length) * 100;
  const previousPath =
    stepIndex <= 0 ? "/onboarding/intro" : `/onboarding/${QUESTION_STEPS[stepIndex - 1]}`;

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
