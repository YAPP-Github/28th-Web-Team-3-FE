"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import type { MissionGenerationCreateRequest } from "@repo/schema/mission-generation";
import { Button, Toggle } from "@repo/ui";
import { useMutation, useQuery } from "@tanstack/react-query";
import { ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { type FormEvent, useEffect, useRef, useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import {
  buildMissionLoadingHref,
  MISSION_CREATION_CATEGORY_CODES,
  MISSION_RECOMMENDATION_CATEGORIES,
} from "@/app/mission/constants/mission-creation";
import {
  amountQuestion,
  categoryQuestion,
  digitsOnly,
  findCategoryName,
  formatWonInput,
  frequencyQuestion,
  MISSION_CHAT_TYPING_DELAY_MS,
  MISSION_FREQUENCY_OPTIONS,
  type MissionChatFormInput,
  missionChatFormSchema,
} from "@/app/mission/new/utils/mission-chat";
import {
  missionCatalogOptions,
  requestGenerationJobOptions,
} from "@/lib/queries/mission-generation";
import { savePendingMissionGeneration } from "../utils/pending-mission-generation";
import { ChatAnswer } from "./chat-answer";
import { ChatComposer } from "./chat-composer";
import { ChatQuestion } from "./chat-question";
import { TypingIndicator } from "./typing-indicator";

const FIELD_BY_STEP = [
  "category",
  "item",
  "baselineFrequency",
  "baselineAmountWon",
] as const satisfies readonly (keyof MissionChatFormInput)[];

export function MissionCreationChat() {
  const router = useRouter();
  const catalog = useQuery(missionCatalogOptions());
  const requestJob = useMutation(requestGenerationJobOptions());
  const [activeStep, setActiveStep] = useState(0);
  const [completedThrough, setCompletedThrough] = useState(-1);
  const [editableStep, setEditableStep] = useState<number>();
  const [directFrequency, setDirectFrequency] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [submitError, setSubmitError] = useState<string>();
  const typingTimerRef = useRef<ReturnType<typeof setTimeout>>(null);
  const conversationRef = useRef<HTMLDivElement>(null);
  const {
    control,
    formState: { errors },
    handleSubmit,
    resetField,
    trigger,
  } = useForm<MissionChatFormInput, undefined, MissionGenerationCreateRequest>({
    defaultValues: {
      baselineAmountWon: "",
      baselineFrequency: "",
    },
    mode: "onChange",
    resolver: zodResolver(missionChatFormSchema),
  });
  const selectedCategoryCode = useWatch({ control, name: "category" });
  const selectedItem = useWatch({ control, name: "item" });
  const frequency = useWatch({
    control,
    name: "baselineFrequency",
    defaultValue: "",
  });
  const amountWon = useWatch({
    control,
    name: "baselineAmountWon",
    defaultValue: "",
  });

  const selectedCategory = findCategoryName(
    selectedCategoryCode,
    MISSION_RECOMMENDATION_CATEGORIES,
    MISSION_CREATION_CATEGORY_CODES,
  );
  const categoryCatalog = catalog.data?.categories.find(
    ({ category }) => category === selectedCategoryCode,
  );
  const selectedItemLabel = categoryCatalog?.items.find(({ code }) => code === selectedItem)?.label;
  const formComplete = completedThrough === FIELD_BY_STEP.length - 1;
  const showsComposer =
    (activeStep === 2 && directFrequency && completedThrough < 2) ||
    (activeStep === 3 && completedThrough < 3);

  useEffect(() => {
    return () => {
      if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
    };
  }, []);

  useEffect(() => {
    const frame = requestAnimationFrame(scrollToConversationEnd);
    return () => cancelAnimationFrame(frame);
  }, [activeStep, completedThrough, directFrequency, isTyping]);

  useEffect(() => {
    const conversation = conversationRef.current;
    if (!conversation || typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(scrollToConversationEnd);
    observer.observe(conversation);
    return () => observer.disconnect();
  }, []);

  function completeStep(step: number) {
    setCompletedThrough(step);
    setEditableStep(step);
    setDirectFrequency(false);
    setSubmitError(undefined);
    if (step === FIELD_BY_STEP.length - 1) return;

    setIsTyping(true);
    typingTimerRef.current = setTimeout(() => {
      setActiveStep(step + 1);
      setIsTyping(false);
      typingTimerRef.current = null;
    }, MISSION_CHAT_TYPING_DELAY_MS);
  }

  function restartFrom(step: number) {
    if (typingTimerRef.current) {
      clearTimeout(typingTimerRef.current);
      typingTimerRef.current = null;
    }
    for (const field of FIELD_BY_STEP.slice(step)) resetField(field);
    setActiveStep(step);
    setCompletedThrough(step - 1);
    setEditableStep(undefined);
    setDirectFrequency(false);
    setIsTyping(false);
    setSubmitError(undefined);
  }

  async function submitComposer(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (activeStep === 2 && directFrequency) {
      if (await trigger("baselineFrequency", { shouldFocus: true })) completeStep(2);
      return;
    }
    if (activeStep === 3) {
      if (await trigger("baselineAmountWon", { shouldFocus: true })) completeStep(3);
    }
  }

  function submit(request: MissionGenerationCreateRequest) {
    setSubmitError(undefined);
    requestJob.mutate(request, {
      onError: () => setSubmitError("미션 생성을 시작하지 못했어요. 잠시 후 다시 시도해 주세요."),
      onSuccess: async (job) => {
        await savePendingMissionGeneration({
          createdAt: Date.now(),
          expiresAt: job.expiresAt,
          jobId: job.jobId,
        });
        router.push(buildMissionLoadingHref(job.jobId));
      },
    });
  }

  function revealEdit(step: number) {
    setEditableStep(step);
  }

  function scrollToConversationEnd() {
    const conversation = conversationRef.current;
    if (conversation) conversation.scrollTop = conversation.scrollHeight;
  }

  function scrollComposerIntoView() {
    requestAnimationFrame(scrollToConversationEnd);
  }

  const chat = (
    <form className="flex min-h-0 flex-1 flex-col" onSubmit={submitComposer}>
      <header className="grid h-11 shrink-0 grid-cols-[44px_1fr_44px] items-center px-2.5">
        <Button
          aria-label="미션 목록으로 돌아가기"
          size="icon"
          variant="ghost"
          onClick={() => router.push("/mission")}
        >
          <ChevronLeft aria-hidden="true" className="size-6" strokeWidth={1.6} />
        </Button>
        <h1 className="text-center text-title-t1-700 text-gray-900">미션 추가</h1>
        <span aria-hidden="true" />
      </header>

      <div aria-hidden="true" className="mx-5 mt-2 h-1 shrink-0 rounded-[22px] bg-gray-800" />

      <div
        ref={conversationRef}
        aria-live="polite"
        aria-relevant="additions text"
        className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto overscroll-contain px-5 pt-8 pb-4"
        role="log"
      >
        <div className="flex flex-col gap-4">
          <ChatQuestion
            className="w-[287px]"
            current={1}
            helper="하나만 선택 가능해요."
            prompt="미션을 생성하고 싶은 카테고리를 선택해주세요."
            promptClassName="whitespace-nowrap"
          >
            <Controller
              control={control}
              name="category"
              render={({ field }) => (
                <div className="flex w-full flex-col gap-2">
                  {MISSION_RECOMMENDATION_CATEGORIES.map(({ name }) => {
                    const code = MISSION_CREATION_CATEGORY_CODES[name];
                    return (
                      <Toggle
                        aria-label={name}
                        className="h-10 w-full justify-start rounded-lg px-4"
                        disabled={completedThrough >= 0 || isTyping}
                        key={name}
                        pressed={field.value === code}
                        variant="chat"
                        onPressedChange={(pressed) => {
                          if (!pressed) return;
                          field.onChange(code);
                          completeStep(0);
                        }}
                      >
                        {name}
                      </Toggle>
                    );
                  })}
                </div>
              )}
            />
          </ChatQuestion>
          {completedThrough >= 0 && selectedCategory ? (
            <ChatAnswer
              editVisible={editableStep === 0}
              label={selectedCategory}
              onEdit={() => restartFrom(0)}
              onSelect={() => revealEdit(0)}
            />
          ) : null}
        </div>

        {activeStep >= 1 ? (
          <div className="flex flex-col gap-4">
            <ChatQuestion
              current={2}
              helper="하나만 선택 가능해요."
              prompt={categoryQuestion(selectedCategory)}
            >
              {catalog.isPending ? (
                <p className="text-caption-c1-500 text-gray-400" role="status">
                  항목을 불러오고 있어요.
                </p>
              ) : categoryCatalog ? (
                <Controller
                  control={control}
                  name="item"
                  render={({ field }) => (
                    <div className="flex max-w-[255px] flex-wrap gap-2">
                      {categoryCatalog.items.map((item) => (
                        <Toggle
                          aria-label={item.label}
                          className="h-[34px] min-w-0 rounded-lg px-5"
                          disabled={completedThrough >= 1 || isTyping}
                          key={item.code}
                          pressed={field.value === item.code}
                          variant="chat"
                          onPressedChange={(pressed) => {
                            if (!pressed) return;
                            field.onChange(item.code);
                            completeStep(1);
                          }}
                        >
                          {item.label}
                        </Toggle>
                      ))}
                    </div>
                  )}
                />
              ) : (
                <Button size="sm" variant="secondary" onClick={() => catalog.refetch()}>
                  다시 불러오기
                </Button>
              )}
            </ChatQuestion>
            {completedThrough >= 1 && selectedItemLabel ? (
              <ChatAnswer
                editVisible={editableStep === 1}
                label={selectedItemLabel}
                onEdit={() => restartFrom(1)}
                onSelect={() => revealEdit(1)}
              />
            ) : null}
          </div>
        ) : null}

        {activeStep >= 2 ? (
          <div className="flex flex-col gap-4">
            <ChatQuestion
              current={3}
              helper="하나만 선택 가능해요."
              prompt={frequencyQuestion(selectedItemLabel)}
            >
              <Controller
                control={control}
                name="baselineFrequency"
                render={({ field }) => (
                  <div className="flex max-w-[255px] flex-wrap gap-2">
                    {MISSION_FREQUENCY_OPTIONS.map(({ label, value }) => (
                      <Toggle
                        aria-label={label}
                        className="h-[34px] min-w-[59px] rounded-lg px-5"
                        disabled={completedThrough >= 2 || isTyping}
                        key={value}
                        pressed={field.value === value}
                        variant="chat"
                        onPressedChange={(pressed) => {
                          if (!pressed) return;
                          field.onChange(value);
                          completeStep(2);
                        }}
                      >
                        {label}
                      </Toggle>
                    ))}
                    <Toggle
                      aria-label="직접입력"
                      className="h-[34px] min-w-0 rounded-lg px-5"
                      disabled={completedThrough >= 2 || isTyping}
                      pressed={directFrequency}
                      variant="chat"
                      onPressedChange={(pressed) => {
                        if (!pressed) return;
                        field.onChange("");
                        setDirectFrequency(true);
                      }}
                    >
                      직접입력
                    </Toggle>
                  </div>
                )}
              />
            </ChatQuestion>
            {completedThrough >= 2 && frequency ? (
              <ChatAnswer
                editVisible={editableStep === 2}
                label={`${frequency}회`}
                onEdit={() => restartFrom(2)}
                onSelect={() => revealEdit(2)}
              />
            ) : null}
          </div>
        ) : null}

        {activeStep >= 3 ? (
          <div className="flex flex-col gap-4">
            <ChatQuestion
              current={4}
              helper="직접 입력해주세요."
              prompt={amountQuestion(selectedItemLabel)}
            />
            {completedThrough >= 3 && amountWon ? (
              <ChatAnswer
                editVisible={editableStep === 3}
                label={formatWonInput(amountWon)}
                onEdit={() => restartFrom(3)}
                onSelect={() => revealEdit(3)}
              />
            ) : null}
          </div>
        ) : null}

        {isTyping ? <TypingIndicator /> : null}
      </div>

      <footer className="flex shrink-0 flex-col gap-2 px-5 pt-2 pb-6">
        {submitError ? (
          <p className="text-center text-body-b2-500 text-error" role="alert">
            {submitError}
          </p>
        ) : null}
        {showsComposer ? (
          <Controller
            control={control}
            name={activeStep === 2 ? "baselineFrequency" : "baselineAmountWon"}
            render={({ field }) => {
              const isAmount = activeStep === 3;
              const displayValue = isAmount ? formatWonInput(field.value) : field.value;
              const fieldError = isAmount ? errors.baselineAmountWon : errors.baselineFrequency;
              const errorMessage = isAmount
                ? "1원 이상 2,000,000원 이하로 입력해주세요."
                : "1회 이상 10회 이하로 입력해주세요.";
              return (
                <div className="flex flex-col gap-1">
                  <ChatComposer
                    ariaDescribedBy={fieldError ? "mission-chat-input-error" : undefined}
                    ariaInvalid={Boolean(fieldError)}
                    autoFocus
                    disabled={!field.value || Boolean(fieldError)}
                    label={isAmount ? "평소 소비 금액" : "평소 이용 횟수"}
                    maxLength={isAmount ? 9 : 2}
                    name={field.name}
                    placeholder={
                      isAmount ? `${selectedItemLabel ?? "소비"}비 입력` : "이용 횟수 입력"
                    }
                    value={displayValue}
                    onFocus={scrollComposerIntoView}
                    onValueChange={(value) => {
                      const digits = digitsOnly(value).slice(0, isAmount ? 7 : 2);
                      field.onChange(digits);
                    }}
                  />
                  {fieldError ? (
                    <p
                      className="px-3 text-caption-c1-500 text-error"
                      id="mission-chat-input-error"
                      role="alert"
                    >
                      {errorMessage}
                    </p>
                  ) : null}
                </div>
              );
            }}
          />
        ) : (
          <Button
            disabled={!formComplete}
            pending={requestJob.isPending}
            size="cta"
            onClick={() => void handleSubmit(submit)()}
          >
            미션 추천 받기
          </Button>
        )}
      </footer>
    </form>
  );

  return (
    <main className="mx-auto flex h-[calc(100dvh-var(--keyboard-inset,0px))] min-h-0 w-full max-w-md flex-col bg-gray-0">
      {chat}
    </main>
  );
}
