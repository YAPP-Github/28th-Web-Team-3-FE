"use client";

import * as ProgressPrimitive from "@radix-ui/react-progress";
import type * as React from "react";
import { cn } from "../lib/utils";

export type ProgressProps = React.ComponentProps<typeof ProgressPrimitive.Root>;

/**
 * 설문 퍼널 상단 진행 게이지바. value는 0~100.
 * 디자인 기준: 트랙 gray-100, 채움 gray-800. 좌우 20px 인셋 배치는 화면 쪽에서 감싼다.
 */
export function Progress({ className, value, ...props }: ProgressProps) {
  return (
    <ProgressPrimitive.Root
      className={cn("relative h-1 w-full rounded-full overflow-hidden bg-gray-100", className)}
      value={value}
      {...props}
    >
      <ProgressPrimitive.Indicator
        className="h-full w-full rounded-full flex-1 bg-gray-800 transition-transform duration-300"
        style={{ transform: `translateX(-${100 - (value ?? 0)}%)` }}
      />
    </ProgressPrimitive.Root>
  );
}
