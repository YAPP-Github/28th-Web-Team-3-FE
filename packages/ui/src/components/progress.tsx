"use client";

import * as ProgressPrimitive from "@radix-ui/react-progress";
import type * as React from "react";
import { cn } from "../lib/utils";

export type ProgressProps = React.ComponentProps<typeof ProgressPrimitive.Root>;

/**
 * 상단 게이지바. 설문 퍼널 헤더 아래 진행률 표시용 얇은 바. value는 0~100.
 * 단독으로도 쓰고, FunnelHeader가 내부에서 조합한다.
 */
export function Progress({ className, value, ...props }: ProgressProps) {
  return (
    <ProgressPrimitive.Root
      className={cn("relative h-1 w-full overflow-hidden bg-gray-100", className)}
      value={value}
      {...props}
    >
      <ProgressPrimitive.Indicator
        className="h-full w-full flex-1 bg-primary transition-transform duration-300"
        style={{ transform: `translateX(-${100 - (value ?? 0)}%)` }}
      />
    </ProgressPrimitive.Root>
  );
}
