"use client";

import * as RadioGroupPrimitive from "@radix-ui/react-radio-group";
import type * as React from "react";
import { cn } from "../lib/utils";

export type OptionGroupProps = React.ComponentProps<typeof RadioGroupPrimitive.Root>;

/**
 * 설문 단일선택 그룹. 세로 리스트가 기본이고,
 * 나이대처럼 2열 그리드면 className으로 `grid grid-cols-2`를 준다.
 */
export function OptionGroup({ className, ...props }: OptionGroupProps) {
  return <RadioGroupPrimitive.Root className={cn("flex flex-col gap-3", className)} {...props} />;
}

export type OptionItemProps = React.ComponentProps<typeof RadioGroupPrimitive.Item>;

/**
 * 설문 선택지 한 줄. 선택되면 파란 배경 + 파란 보더.
 * 보더 색은 디자인이 리스트(gray-200)/그리드(gray-100)로 갈리는데 단일화 확인 전까지 gray-200.
 */
export function OptionItem({ className, children, ...props }: OptionItemProps) {
  return (
    <RadioGroupPrimitive.Item
      className={cn(
        "flex h-[52px] w-full items-center rounded-[12px] border border-gray-200 bg-background px-4 text-left text-body-b1-500 text-gray-900 transition-colors",
        "data-[state=checked]:border-blue-500 data-[state=checked]:bg-blue-50",
        "disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        className,
      )}
      {...props}
    >
      {children}
    </RadioGroupPrimitive.Item>
  );
}
