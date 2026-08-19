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
  /**
   * 다음 버튼이 시작한 작업을 기다리는 중. 문구는 그대로 두고 눌린 상태만 유지한다.
   * 기다리는 동안 이전 버튼도 막는다 — 저장 중에 뒤로 가면 어느 쪽이 이긴 상태인지
   * 화면만 봐서는 알 수 없다.
   */
  nextPending?: boolean;
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
  nextPending = false,
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
          // 다음을 누른 동안에도 흐려지지 않게 `disabled:opacity-100`으로 덮는다.
          // 흐려지면 화면에서 제일 크게 변하는 게 이 버튼이라, 방금 누른 다음이 아니라
          // 이쪽이 반응한 것처럼 보인다. 못 누르는 것은 `disabled`가 그대로 막는다.
          className="w-[105px] shrink-0 text-gray-800 disabled:opacity-100"
          disabled={nextPending}
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
        pending={nextPending}
        onClick={onNext}
      >
        {nextLabel}
      </Button>
    </div>
  );
}
