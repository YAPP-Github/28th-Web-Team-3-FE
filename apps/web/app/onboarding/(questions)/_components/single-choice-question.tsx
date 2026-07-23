"use client";

import type { OnboardingFormValues } from "@repo/schema";
import { ButtonGroup, OptionGroup, OptionItem } from "@repo/ui";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Controller, useFormContext, useWatch } from "react-hook-form";
import {
  SINGLE_CHOICE_QUESTION_DEFINITIONS,
  type SingleChoiceQuestionStep,
} from "@/app/onboarding/constants/questions";
import {
  getNextOnboardingQuestionPath,
  getPreviousOnboardingQuestionPath,
} from "@/app/onboarding/lib/question-navigation";

interface SingleChoiceQuestionPageProps {
  questionStep: SingleChoiceQuestionStep;
}

export function SingleChoiceQuestionPage({ questionStep }: SingleChoiceQuestionPageProps) {
  const router = useRouter();
  const { control } = useFormContext<OnboardingFormValues>();
  const { choices, description, formFieldName, questionTitle } =
    SINGLE_CHOICE_QUESTION_DEFINITIONS[questionStep];
  const selectedChoiceValue = useWatch({ control, name: formFieldName });
  const previousQuestionPath = getPreviousOnboardingQuestionPath(questionStep);
  const nextQuestionPath = getNextOnboardingQuestionPath(questionStep);

  useEffect(() => {
    router.prefetch(previousQuestionPath);
    router.prefetch(nextQuestionPath);
  }, [nextQuestionPath, previousQuestionPath, router]);

  return (
    <div className="flex min-h-[calc(100dvh-56px)] flex-col px-5 pt-8">
      <section>
        <h1 className="whitespace-pre-line text-headline-h2-700 text-black">{questionTitle}</h1>
        <p className="mt-1 text-body-b1-400 text-gray-700">{description}</p>
        <Controller
          control={control}
          name={formFieldName}
          render={({ field: controlledField }) => (
            <OptionGroup
              aria-label={questionTitle.replace("\n", " ")}
              className="mt-8"
              value={controlledField.value}
              onValueChange={controlledField.onChange}
            >
              {choices.map((choice) => (
                <OptionItem key={choice.value} value={choice.value}>
                  {choice.label}
                </OptionItem>
              ))}
            </OptionGroup>
          )}
        />
      </section>
      <div className="mt-auto pt-8 pb-6">
        <ButtonGroup
          nextDisabled={selectedChoiceValue === ""}
          onNext={() => router.push(nextQuestionPath)}
          onPrev={() => router.push(previousQuestionPath)}
        />
      </div>
    </div>
  );
}
