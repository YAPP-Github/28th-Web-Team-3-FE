"use client";

import { X } from "lucide-react";
import type * as React from "react";
import { cn } from "../lib/utils";
import { Progress } from "./progress";

export interface FunnelHeaderProps extends React.HTMLAttributes<HTMLElement> {
  /** 현재 단계 (1부터 시작). */
  step: number;
  /** 전체 단계 수. */
  totalSteps: number;
  /** 뒤로가기 눌렀을 때. 생략하면 뒤로가기 버튼을 숨긴다(퍼널 첫 화면). */
  onBack?: () => void;
}

/**
 * 설문 퍼널 상단 헤더 — 뒤로가기 + 진행 게이지바.
 * 와이어프레임 기준: 좌상단 X 버튼, 그 아래 전체 폭 얇은 파란 진행바.
 * 앞으로가기는 별도 버튼이 없고 화면 하단 CTA(Button size="full")가 담당한다.
 */
export function FunnelHeader({ step, totalSteps, onBack, className, ...props }: FunnelHeaderProps) {
  return (
    <header className={cn("w-full", className)} {...props}>
      <div className="flex h-12 items-center px-2">
        {onBack && (
          <button
            type="button"
            aria-label="뒤로가기"
            onClick={onBack}
            className="flex size-10 items-center justify-center rounded-md text-foreground hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <X className="size-6" />
          </button>
        )}
      </div>
      <Progress value={(step / totalSteps) * 100} aria-label={`${totalSteps}단계 중 ${step}단계`} />
    </header>
  );
}
