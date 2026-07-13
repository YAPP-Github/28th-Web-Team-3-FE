"use client";

import * as SliderPrimitive from "@radix-ui/react-slider";
import type * as React from "react";
import { cn } from "../lib/utils";

export interface SliderProps extends React.ComponentProps<typeof SliderPrimitive.Root> {
  /** 썸별 스크린리더 라벨. 범위 슬라이더면 ["최소 나이", "최대 나이"]처럼 순서대로. */
  thumbLabels?: string[];
}

/**
 * range 슬라이더. 나이·금액처럼 드래그로 값을 고르는 입력.
 * 값 표시(라벨)는 화면 쪽에서 value를 받아 직접 렌더한다.
 */
export function Slider({ className, thumbLabels, ...props }: SliderProps) {
  return (
    <SliderPrimitive.Root
      className={cn(
        "relative flex w-full touch-none select-none items-center",
        "data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
        className,
      )}
      {...props}
    >
      <SliderPrimitive.Track className="relative h-1.5 w-full grow overflow-hidden rounded-full bg-gray-100">
        <SliderPrimitive.Range className="absolute h-full bg-primary" />
      </SliderPrimitive.Track>
      {/* value/defaultValue 개수만큼 썸을 렌더 — 단일·범위 슬라이더 모두 대응. */}
      {(props.value ?? props.defaultValue ?? [0]).map((_, i) => (
        <SliderPrimitive.Thumb
          key={i}
          aria-label={thumbLabels?.[i]}
          className={cn(
            "block size-5 rounded-full border-2 border-primary bg-background shadow",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          )}
        />
      ))}
    </SliderPrimitive.Root>
  );
}
