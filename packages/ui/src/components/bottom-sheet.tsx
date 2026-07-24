"use client";

import * as DialogPrimitive from "@radix-ui/react-dialog";
import type * as React from "react";
import { useEffect, useRef, useState } from "react";
import { cn } from "../lib/utils";

export interface BottomSheetProps extends React.ComponentProps<typeof DialogPrimitive.Root> {
  /** 시트 상단 타이틀 (예: "직접 입력"). */
  title: string;
  /** 시트를 여는 트리거 요소. 제어 컴포넌트로 쓰면 생략. */
  trigger?: React.ReactNode;
  /** 시트 본문. */
  children?: React.ReactNode;
  /** DialogPrimitive.Content에 얹을 클래스. */
  contentClassName?: string;
}

/**
 * 화면 하단에서 올라오는 시트 (직접 입력 등).
 * 핸들 색은 디자인 #E0E4EA인데 토큰이 없어 gray-100(#DFE4EC)으로 대체 — 디자이너 확인 대기.
 */
export function BottomSheet({
  title,
  trigger,
  children,
  contentClassName,
  ...rootProps
}: BottomSheetProps) {
  const [keyboardInset, setKeyboardInset] = useState(0);
  const keyboardInsetRef = useRef(0);
  const animationFrameRef = useRef<number | null>(null);
  const resetTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const closeResetTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!rootProps.open) {
      if (animationFrameRef.current !== null) cancelAnimationFrame(animationFrameRef.current);
      if (resetTimeoutRef.current !== null) clearTimeout(resetTimeoutRef.current);
      if (closeResetTimeoutRef.current !== null) clearTimeout(closeResetTimeoutRef.current);
      closeResetTimeoutRef.current = setTimeout(() => {
        keyboardInsetRef.current = 0;
        setKeyboardInset(0);
      }, 160);
      return;
    }

    if (closeResetTimeoutRef.current !== null) clearTimeout(closeResetTimeoutRef.current);

    const viewport = window.visualViewport;
    if (!viewport) return;

    function updateKeyboardInset() {
      if (!viewport) return;
      if (animationFrameRef.current !== null) cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = requestAnimationFrame(() => {
        const nextInset = Math.max(0, window.innerHeight - viewport.height - viewport.offsetTop);
        if (nextInset === keyboardInsetRef.current) return;
        if (resetTimeoutRef.current !== null) clearTimeout(resetTimeoutRef.current);
        if (nextInset < keyboardInsetRef.current) {
          resetTimeoutRef.current = setTimeout(() => {
            keyboardInsetRef.current = nextInset;
            setKeyboardInset(nextInset);
          }, 120);
          return;
        }
        keyboardInsetRef.current = nextInset;
        setKeyboardInset(nextInset);
      });
    }

    updateKeyboardInset();
    viewport.addEventListener("resize", updateKeyboardInset);
    viewport.addEventListener("scroll", updateKeyboardInset);
    return () => {
      if (animationFrameRef.current !== null) cancelAnimationFrame(animationFrameRef.current);
      if (resetTimeoutRef.current !== null) clearTimeout(resetTimeoutRef.current);
      if (closeResetTimeoutRef.current !== null) clearTimeout(closeResetTimeoutRef.current);
      viewport.removeEventListener("resize", updateKeyboardInset);
      viewport.removeEventListener("scroll", updateKeyboardInset);
    };
  }, [rootProps.open]);

  return (
    <DialogPrimitive.Root {...rootProps}>
      {trigger && <DialogPrimitive.Trigger asChild>{trigger}</DialogPrimitive.Trigger>}
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-dim-light" />
        <DialogPrimitive.Content
          aria-describedby={undefined}
          className={cn(
            // 내용이 뷰포트(키보드 등)를 넘치면 시트 안에서 세로 스크롤.
            // overscroll-contain으로 뒤 배경 스크롤 전파 차단.
            "fixed inset-x-0 bottom-0 z-50 max-h-[calc(100dvh-var(--keyboard-inset,0px))] overflow-y-auto overscroll-contain rounded-t-[20px] bg-background focus:outline-none",
            contentClassName,
          )}
          style={
            {
              "--keyboard-inset": `${keyboardInset}px`,
              transform: `translateY(-${keyboardInset}px)`,
            } as React.CSSProperties
          }
        >
          <div className="flex justify-center pt-3 pb-2">
            <div className="h-1 w-9 rounded-full bg-gray-100" aria-hidden />
          </div>
          <DialogPrimitive.Title className="px-5 pt-2 text-title-t2-700 text-gray-900">
            {title}
          </DialogPrimitive.Title>
          {children}
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
