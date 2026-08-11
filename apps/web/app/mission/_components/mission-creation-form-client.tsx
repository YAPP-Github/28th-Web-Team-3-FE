"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  type ActiveMissionCategory,
  activeMissionCategorySchema,
  type MissionItem,
  missionItemSchema,
} from "@repo/schema/mission";
import {
  type MissionGenerationCreateRequest,
  missionBaselineAmountWonSchema,
  missionBaselineFrequencySchema,
  missionGenerationCreateRequestSchema,
} from "@repo/schema/mission-generation";
import { Button, ButtonGroup, Input, Progress } from "@repo/ui";
import { useMutation, useQuery } from "@tanstack/react-query";
import { ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { MissionListSkeleton } from "@/app/_components/mission-list-skeleton";
import type { MissionCreationCategory } from "@/app/mission/constants/mission-creation";
import { buildMissionGeneratingHref } from "@/app/mission/constants/mission-creation";
import {
  missionCatalogOptions,
  requestGenerationJobOptions,
} from "@/lib/queries/mission-generation";
import { MissionCreationIntro } from "./mission-creation-intro";
import { OptionPillList } from "./survey/option-pill-list";

const QUESTION_COUNT = 3;
const numericInputSchema = z.string().regex(/^\d+$/).transform(Number);
const missionCreationFormSchema = z
  .object({
    category: activeMissionCategorySchema,
    item: missionItemSchema,
    baselineFrequency: numericInputSchema.pipe(missionBaselineFrequencySchema),
    baselineAmountManwon: numericInputSchema
      .transform((amountManwon) => amountManwon * 10_000)
      .pipe(missionBaselineAmountWonSchema),
  })
  .transform(({ baselineAmountManwon, ...request }) => ({
    ...request,
    baselineAmountWon: baselineAmountManwon,
  }))
  .pipe(missionGenerationCreateRequestSchema);

type MissionCreationFormInput = z.input<typeof missionCreationFormSchema>;

interface MissionCreationFormClientProps {
  category: MissionCreationCategory;
  categoryCode: ActiveMissionCategory;
  previousHref: string;
}

function digitsOnly(value: string) {
  return value.replace(/\D/g, "");
}

function questionPrompt(
  step: number,
  categoryCode: ActiveMissionCategory,
  selectedItemLabel: string | undefined,
) {
  const subject = selectedItemLabel ?? "선택한 항목";
  if (step === 0) {
    if (categoryCode === "MEAL") return "식비 중 줄이고 싶은 항목이 무엇인가요?";
    if (categoryCode === "LIVING") return "생활비 중 줄이고 싶은 항목이 무엇인가요?";
    return "취미비 중 줄이고 싶은 항목이 무엇인가요?";
  }
  if (step === 1) {
    return categoryCode === "MEAL"
      ? `한 주에 ${subject}을 몇 번 이용하나요?`
      : `한 주에 ${subject}에 몇 번 소비하나요?`;
  }
  return categoryCode === "MEAL"
    ? `한 주에 ${subject}으로 대략 얼마 쓰시나요?`
    : `한 주에 ${subject}에 대략 얼마 쓰시나요?`;
}

export function MissionCreationFormClient({
  category,
  categoryCode,
  previousHref,
}: MissionCreationFormClientProps) {
  const router = useRouter();
  const catalog = useQuery(missionCatalogOptions());
  const requestJob = useMutation(requestGenerationJobOptions());
  const [phase, setPhase] = useState<"intro" | "questions">("intro");
  const [step, setStep] = useState(0);
  const questionHeadingRef = useRef<HTMLHeadingElement>(null);
  const {
    control,
    formState: { errors },
    handleSubmit,
    register,
    trigger,
  } = useForm<MissionCreationFormInput, undefined, MissionGenerationCreateRequest>({
    defaultValues: {
      category: categoryCode,
      baselineFrequency: "",
      baselineAmountManwon: "",
    },
    mode: "onChange",
    resolver: zodResolver(missionCreationFormSchema),
  });
  const selectedItem = useWatch({ control, name: "item" });
  const frequency = useWatch({ control, name: "baselineFrequency" });
  const amountManwon = useWatch({ control, name: "baselineAmountManwon" });
  const frequencyField = register("baselineFrequency");
  const amountField = register("baselineAmountManwon");

  const categoryCatalog = catalog.data?.categories.find(
    (candidate) => candidate.category === categoryCode,
  );
  const selectedItemLabel = categoryCatalog?.items.find(
    (item) => item.code === selectedItem,
  )?.label;
  const nextDisabled =
    step === 0
      ? !selectedItem || Boolean(errors.item)
      : step === 1
        ? !frequency || Boolean(errors.baselineFrequency)
        : !amountManwon || Boolean(errors.baselineAmountManwon);

  useEffect(() => {
    if (phase === "questions" && categoryCatalog) {
      questionHeadingRef.current?.focus();
    }
  }, [categoryCatalog, phase, step]);

  function goBack() {
    if (step > 0) {
      setStep((current) => current - 1);
      return;
    }
    setPhase("intro");
  }

  function submit(request: MissionGenerationCreateRequest) {
    requestJob.mutate(request, {
      onSuccess: (job) => router.push(buildMissionGeneratingHref(job.jobId)),
    });
  }

  async function proceed() {
    if (step < QUESTION_COUNT - 1) {
      const currentField = step === 0 ? "item" : "baselineFrequency";
      if (!(await trigger(currentField, { shouldFocus: true }))) return;
      setStep((current) => current + 1);
      return;
    }
    await handleSubmit(submit)();
  }

  if (phase === "intro") {
    return (
      <MissionCreationIntro
        category={category}
        previousHref={previousHref}
        onNext={() => setPhase("questions")}
      />
    );
  }

  if (catalog.isPending) {
    return (
      <main className="flex min-h-dvh flex-col bg-gray-0">
        <MissionListSkeleton className="px-5 pt-20" count={3} label="소비 항목을 불러오는 중" />
      </main>
    );
  }

  if (!categoryCatalog) {
    return (
      <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col bg-gray-0 px-5 pt-20">
        <p role="alert" className="text-center text-body-b2-500 text-gray-500">
          소비 항목을 불러오지 못했어요.
        </p>
        <Button className="mt-4" size="cta" onClick={() => catalog.refetch()}>
          다시 시도
        </Button>
      </main>
    );
  }

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col bg-gray-0 pb-6">
      <Button aria-label="이전 단계로 돌아가기" size="icon" variant="ghost" onClick={goBack}>
        <ChevronLeft aria-hidden="true" className="size-6" />
      </Button>

      <div className="px-5 pt-2">
        <Progress aria-label="질문 진행률" value={((step + 1) / QUESTION_COUNT) * 100} />
      </div>

      <section className="flex flex-1 flex-col gap-8 px-5 pt-8">
        <h1 ref={questionHeadingRef} className="text-headline-h2-700 text-gray-900" tabIndex={-1}>
          {questionPrompt(step, categoryCode, selectedItemLabel)}
        </h1>

        {step === 0 ? (
          <Controller
            control={control}
            name="item"
            render={({ field }) => (
              <OptionPillList
                options={categoryCatalog.items}
                selectedCodes={field.value ? [field.value] : []}
                onToggle={(code) => field.onChange(code as MissionItem)}
              />
            )}
          />
        ) : null}

        {step === 1 ? (
          <div className="flex flex-col gap-2">
            <label className="sr-only" htmlFor="mission-frequency">
              주간 소비 횟수
            </label>
            <Input
              {...frequencyField}
              id="mission-frequency"
              aria-describedby="mission-frequency-help"
              aria-invalid={frequency !== "" && Boolean(errors.baselineFrequency)}
              inputMode="numeric"
              maxLength={2}
              placeholder="횟수를 입력해 주세요"
              type="text"
              onChange={(event) => {
                event.target.value = digitsOnly(event.target.value);
                void frequencyField.onChange(event);
              }}
            />
            <p id="mission-frequency-help" className="text-body-b2-400 text-gray-500">
              1회부터 10회까지 입력할 수 있어요.
            </p>
          </div>
        ) : null}

        {step === 2 ? (
          <div className="flex flex-col gap-2">
            <label className="sr-only" htmlFor="mission-amount">
              주간 소비 금액(만원)
            </label>
            <div className="relative">
              <Input
                {...amountField}
                id="mission-amount"
                aria-describedby="mission-amount-help"
                aria-invalid={amountManwon !== "" && Boolean(errors.baselineAmountManwon)}
                className="pr-14"
                inputMode="numeric"
                maxLength={3}
                placeholder="금액을 입력해 주세요"
                type="text"
                onChange={(event) => {
                  event.target.value = digitsOnly(event.target.value);
                  void amountField.onChange(event);
                }}
              />
              <span
                aria-hidden="true"
                className="absolute top-1/2 right-4 -translate-y-1/2 text-body-b1-500 text-gray-700"
              >
                만원
              </span>
            </div>
            <p id="mission-amount-help" className="text-body-b2-400 text-gray-500">
              1만원부터 200만원까지 입력할 수 있어요.
            </p>
          </div>
        ) : null}
      </section>

      <div className="flex flex-col gap-2 px-5 pt-2">
        {requestJob.isError ? (
          <p role="alert" className="text-center text-body-b2-500 text-red-500">
            미션 생성을 시작하지 못했어요. 잠시 후 다시 시도해 주세요.
          </p>
        ) : null}
        <ButtonGroup
          nextDisabled={nextDisabled}
          nextPending={requestJob.isPending}
          onNext={proceed}
          onPrev={goBack}
        />
      </div>
    </main>
  );
}
