"use client";

import * as DialogPrimitive from "@radix-ui/react-dialog";
import type * as React from "react";
import { useRef } from "react";
import { cn } from "../lib/utils";

export interface DialogProps extends React.ComponentProps<typeof DialogPrimitive.Root> {
  /** 다이얼로그 제목. 스크린리더가 읽는 이름이 된다. */
  title: string;
  /** 제목 아래 본문. 버튼도 여기에 넣는다. */
  children?: React.ReactNode;
  /** DialogPrimitive.Content에 얹을 클래스. */
  contentClassName?: string;
}

/**
 * 화면 가운데 뜨는 다이얼로그. 하단에서 올라오는 시트는 `BottomSheet`를 쓴다.
 *
 * 포커스 트랩, 초기 포커스, Escape 닫기, 포커스 복원, 배경 aria-hidden, 스크롤 잠금을
 * Radix가 처리한다. div에 `aria-modal`만 붙이면 스크린리더에는 모달이라고 알려놓고
 * 실제로는 초점이 뒤 화면으로 새어 나간다 — 속성을 안 붙인 것보다 나쁘다.
 */
export function Dialog({ title, children, contentClassName, ...rootProps }: DialogProps) {
  const openerRef = useRef<HTMLElement | null>(null);

  return (
    <DialogPrimitive.Root {...rootProps}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-dim-light" />
        <DialogPrimitive.Content
          aria-describedby={undefined}
          // Radix는 `Dialog.Trigger`로 연 경우에만 닫을 때 초점을 돌려준다. 목록 안 버튼처럼
          // 트리거를 따로 두지 않으면 초점이 body로 떨어져 사용자가 있던 위치를 잃는다.
          // 열릴 때 누가 열었는지 기억했다가 직접 돌려준다.
          onOpenAutoFocus={() => {
            openerRef.current = document.activeElement as HTMLElement | null;
          }}
          onCloseAutoFocus={(event) => {
            event.preventDefault();
            openerRef.current?.focus();
          }}
          className={cn(
            "-translate-x-1/2 -translate-y-1/2 fixed top-1/2 left-1/2 z-50 flex w-[calc(100%-2.5rem)] max-w-[298px] flex-col items-center gap-5 rounded-2xl bg-gray-0 p-5 focus:outline-none",
            contentClassName,
          )}
        >
          <DialogPrimitive.Title className="text-center text-title-t2-700 text-gray-900">
            {title}
          </DialogPrimitive.Title>
          {children}
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
