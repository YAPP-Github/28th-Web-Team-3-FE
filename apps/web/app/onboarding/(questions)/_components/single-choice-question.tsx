"use client";

import type { OnboardingFormValues } from "@repo/schema";
import { ButtonGroup, OptionGroup, OptionItem } from "@repo/ui";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Controller, useFormContext } from "react-hook-form";

type ChoiceFieldName =
  | "financialAssetRatio"
  | "investmentExperience"
  | "investmentPeriod"
  | "lossTolerance"
  | "riskPreference"
  | "taxSavingInterest";

interface ChoiceOption {
  label: string;
  value: string;
}

interface SingleChoiceQuestionProps {
  fieldName: ChoiceFieldName;
  nextPath: string;
  options: readonly ChoiceOption[];
  prevPath: string;
  subtitle: string;
  title: string;
}

export function SingleChoiceQuestion({
  fieldName,
  nextPath,
  options,
  prevPath,
  subtitle,
  title,
}: SingleChoiceQuestionProps) {
  const router = useRouter();
  const { control, watch } = useFormContext<OnboardingFormValues>();
  const selectedValue = watch(fieldName);

  useEffect(() => {
    router.prefetch(prevPath);
    router.prefetch(nextPath);
  }, [nextPath, prevPath, router]);

  return (
    <div className="flex min-h-[calc(100dvh-56px)] flex-col px-5 pt-8">
      <section>
        <h1 className="whitespace-pre-line text-headline-h2-700 text-black">{title}</h1>
        <p className="mt-1 text-body-b1-400 text-gray-700">{subtitle}</p>
        <Controller
          control={control}
          name={fieldName}
          render={({ field }) => (
            <OptionGroup
              aria-label={title.replace("\n", " ")}
              className="mt-8"
              value={field.value}
              onValueChange={field.onChange}
            >
              {options.map((option) => (
                <OptionItem key={option.value} value={option.value}>
                  {option.label}
                </OptionItem>
              ))}
            </OptionGroup>
          )}
        />
      </section>
      <div className="mt-auto pt-8 pb-6">
        <ButtonGroup
          nextDisabled={selectedValue === ""}
          onNext={() => router.push(nextPath)}
          onPrev={() => router.push(prevPath)}
        />
      </div>
    </div>
  );
}
