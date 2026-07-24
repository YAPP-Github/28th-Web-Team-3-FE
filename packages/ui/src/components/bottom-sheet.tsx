"use client";

import * as DialogPrimitive from "@radix-ui/react-dialog";
import type * as React from "react";
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
  return (
    <DialogPrimitive.Root {...rootProps}>
      {trigger && <DialogPrimitive.Trigger asChild>{trigger}</DialogPrimitive.Trigger>}
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-dim-light" />
        <DialogPrimitive.Content
          aria-describedby={undefined}
          className={cn(
            // 내용이 뷰포트(키보드 등)를 넘치면 시트 안에서 세로 스크롤. overscroll-contain으로 뒤 배경 스크롤 전파 차단.
            "fixed inset-x-0 bottom-0 z-50 max-h-[85dvh] overflow-y-auto overscroll-contain rounded-t-[20px] bg-background focus:outline-none",
            contentClassName,
          )}
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
