"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  type ActiveMissionCategory,
  MAX_MANUAL_MISSION_TEXT_LENGTH,
  type ManualMissionCreateRequest,
  manualMissionCreateRequestSchema,
} from "@repo/schema/mission";
import { Button, Input, OptionGroup, OptionItem } from "@repo/ui";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import type { z } from "zod";
import {
  MISSION_CREATION_CATEGORY_CODES,
  MISSION_RECOMMENDATION_CATEGORIES,
} from "@/app/mission/constants/mission-creation";
import { markMissionCreationStarted } from "@/app/mission/new/utils/mission-creation-history";
import { createManualMissionOptions } from "@/lib/queries/mission";

const MANUAL_MISSION_CATEGORIES = MISSION_RECOMMENDATION_CATEGORIES.map(({ name }) => ({
  label: name,
  value: MISSION_CREATION_CATEGORY_CODES[name],
}));

type ManualMissionCreateInput = z.input<typeof manualMissionCreateRequestSchema>;

export default function ManualMissionPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const createMission = useMutation(createManualMissionOptions(queryClient));
  const [submitError, setSubmitError] = useState<string>();
  const {
    control,
    formState: { errors, isValid },
    handleSubmit,
    register,
  } = useForm<ManualMissionCreateInput, undefined, ManualMissionCreateRequest>({
    defaultValues: { text: "" },
    mode: "onChange",
    resolver: zodResolver(manualMissionCreateRequestSchema),
  });
  const missionText = useWatch({ control, name: "text", defaultValue: "" });
  const missionTextField = register("text");

  function submit(request: ManualMissionCreateRequest) {
    setSubmitError(undefined);
    createMission.mutate(request, {
      onError: () => setSubmitError("미션을 추가하지 못했어요. 잠시 후 다시 시도해 주세요."),
      onSuccess: () => {
        void markMissionCreationStarted();
        router.push("/mission");
      },
    });
  }

  return (
    <main className="mx-auto min-h-dvh w-full max-w-md bg-gray-0">
      <header className="grid h-11 grid-cols-[44px_1fr_44px] items-center px-2.5">
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

      <form
        className="flex min-h-[calc(100dvh-44px)] flex-col px-5 pt-[35px] pb-6"
        onSubmit={handleSubmit(submit)}
      >
        <div className="flex flex-col gap-8">
          <fieldset>
            <legend
              id="manual-mission-category-label"
              className="mb-2 text-body-b2-500 text-gray-700"
            >
              미션 카테고리 선택
            </legend>
            <Controller
              control={control}
              name="category"
              render={({ field }) => (
                <OptionGroup
                  aria-invalid={Boolean(errors.category)}
                  aria-labelledby="manual-mission-category-label"
                  aria-required="true"
                  className="grid grid-cols-2 gap-3"
                  value={field.value ?? ""}
                  onValueChange={(value) => {
                    field.onChange(value as ActiveMissionCategory);
                    setSubmitError(undefined);
                  }}
                >
                  {MANUAL_MISSION_CATEGORIES.map(({ label, value }) => (
                    <OptionItem className="border-gray-100" key={value} value={value}>
                      {label}
                    </OptionItem>
                  ))}
                </OptionGroup>
              )}
            />
          </fieldset>

          <div className="flex flex-col gap-2">
            <label className="text-body-b2-500 text-gray-700" htmlFor="manual-mission-text">
              미션 내용
            </label>
            <Input
              {...missionTextField}
              aria-describedby="manual-mission-text-count"
              aria-invalid={Boolean(errors.text)}
              autoComplete="off"
              id="manual-mission-text"
              maxLength={MAX_MANUAL_MISSION_TEXT_LENGTH}
              placeholder="예)일주일에 3번 집밥먹기"
              required
              onChange={(event) => {
                event.target.value = event.target.value.slice(0, MAX_MANUAL_MISSION_TEXT_LENGTH);
                void missionTextField.onChange(event);
                setSubmitError(undefined);
              }}
            />
            <p
              aria-live="polite"
              className="text-right text-caption-c1-500 text-gray-700 tabular-nums"
              id="manual-mission-text-count"
            >
              {missionText.length}/{MAX_MANUAL_MISSION_TEXT_LENGTH}
            </p>
          </div>
        </div>

        {submitError ? (
          <p className="mt-auto pb-2 text-center text-body-b2-500 text-error" role="alert">
            {submitError}
          </p>
        ) : null}
        <Button
          className={submitError ? undefined : "mt-auto"}
          disabled={!isValid}
          pending={createMission.isPending}
          size="cta"
          type="submit"
        >
          완료
        </Button>
      </form>
    </main>
  );
}
