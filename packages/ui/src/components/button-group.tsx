"use client";

import type * as React from "react";
import { cn } from "../lib/utils";
import { Button } from "./button";

export interface ButtonGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  /** 이전 눌렀을 때. 생략하면 이전 버튼을 숨긴다(퍼널 첫 화면 단독 CTA). */
  onPrev?: () => void;
  /** 다음(또는 완료) 눌렀을 때. */
  onNext?: () => void;
  prevLabel?: string;
  nextLabel?: string;
  nextDisabled?: boolean;
  /** 다음 버튼을 submit으로 쓸 때. */
  nextType?: "button" | "submit";
}

/**
 * 퍼널 하단 이전/다음 버튼 조합 — 이전은 105px 고정, 다음은 남은 폭 (Figma ButtonGroup).
 * 하단 고정 배치(px-5 pt-2 pb-6)는 화면 쪽에서 감싼다.
 */
export function ButtonGroup({
  onPrev,
  onNext,
  prevLabel = "이전",
  nextLabel = "다음",
  nextDisabled,
  nextType = "button",
  className,
  ...props
}: ButtonGroupProps) {
  return (
    <div className={cn("flex w-full items-center gap-2.5", className)} {...props}>
      {onPrev && (
        <Button
          type="button"
          variant="secondary"
          size="cta"
          className="w-[105px] shrink-0"
          onClick={onPrev}
        >
          {prevLabel}
        </Button>
      )}
      <Button
        type={nextType}
        size="cta"
        className="flex-1"
        disabled={nextDisabled}
        onClick={onNext}
      >
        {nextLabel}
      </Button>
    </div>
  );
}
