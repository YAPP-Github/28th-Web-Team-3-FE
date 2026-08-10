"use client";

import * as DialogPrimitive from "@radix-ui/react-dialog";
import type * as React from "react";
import { useEffect, useRef, useState } from "react";
import { cn } from "../lib/utils";

/** 이만큼 끌어내리면 손을 뗄 때 닫는다. 그보다 짧으면 제자리로 돌아간다. */
const CLOSE_DISTANCE_PX = 80;
const SNAP_BACK_MS = 200;
const SNAP_BACK_EASING = "cubic-bezier(0.32, 0.72, 0, 1)";

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
 *
 * 위쪽(핸들+제목)을 아래로 끌면 닫힌다. 핸들 바가 끌 수 있게 생겼는데 실제로는 장식이면
 * 사용자는 당겨보고 안 닫힌다고 느낀다. 끌기를 위쪽으로만 한정한 이유는 본문의 세로 스크롤과
 * 겹치지 않게 하려는 것이다 — 본문까지 받으면 매 제스처마다 스크롤인지 끌기인지 가려야 한다.
 *
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
  const [dragOffset, setDragOffset] = useState(0);
  const [isSnappingBack, setIsSnappingBack] = useState(false);
  /** 끌기 시작 y. null이면 끌고 있지 않다. */
  const dragStartYRef = useRef<number | null>(null);
  /**
   * 끌기를 시작한 포인터. 포인터 캡처는 이 포인터만 붙잡으므로, 헤더에 나중에 닿은 손가락의
   * 이동·뗌은 캡처를 우회해 그대로 들어온다. 그걸 첫 손가락의 기준점으로 계산하면 시트가
   * 튀거나, 두 번째 손가락을 떼는 순간 닫힌다.
   */
  const activePointerIdRef = useRef<number | null>(null);
  // Radix에는 밖에서 닫을 방법이 없다. 비제어로 써도 동작하도록 숨긴 Close를 눌러
  // Radix가 자기 상태까지 갱신하게 한다 — onOpenChange만 부르면 비제어일 때 안 닫힌다.
  const closeRef = useRef<HTMLButtonElement>(null);

  /** 끌던 도중에 닫히면 옮겨둔 만큼이 남아, 다음에 열 때 그 자리에서 뜬다. */
  function resetDrag() {
    activePointerIdRef.current = null;
    dragStartYRef.current = null;
    setDragOffset(0);
    setIsSnappingBack(false);
  }

  const keyboardInsetRef = useRef(0);
  const animationFrameRef = useRef<number | null>(null);
  const resetTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const closeResetTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!rootProps.open) {
      // 부모가 open을 내려 닫는 경로(저장 성공 등). Root의 onOpenChange를 타지 않는다.
      activePointerIdRef.current = null;
      dragStartYRef.current = null;
      setDragOffset(0);
      setIsSnappingBack(false);
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

  /**
   * `releasedAtY`가 null이면 복귀만 한다 — 취소는 사용자가 손을 뗀 게 아니다.
   *
   * 판정은 state가 아니라 손 뗀 좌표로 한다. `pointermove`는 continuous lane이라
   * discrete인 `pointerup`이 먼저 처리되고, 그 시점의 `dragOffset`은 한 프레임 이상
   * 뒤처져 있을 수 있다. 80px 임계에서 그 차이는 손가락 속도에 따라 수십 px이다.
   * 테스트에서는 `fireEvent`가 매번 동기 flush를 해서 이 틈이 드러나지 않는다.
   */
  function endDrag(pointerId: number, releasedAtY: number | null) {
    const startY = dragStartYRef.current;
    if (startY === null || pointerId !== activePointerIdRef.current) return;
    activePointerIdRef.current = null;
    dragStartYRef.current = null;
    setIsSnappingBack(true);
    setDragOffset(0);
    if (releasedAtY !== null && releasedAtY - startY > CLOSE_DISTANCE_PX) closeRef.current?.click();
  }

  return (
    <DialogPrimitive.Root
      {...rootProps}
      // Escape·오버레이·닫기 버튼으로 닫는 경로. 비제어로 쓰면 open이 안 바뀌므로
      // 위 effect가 못 잡는다 — 여기서 한 번 더 되돌린다.
      onOpenChange={(open) => {
        if (!open) resetDrag();
        rootProps.onOpenChange?.(open);
      }}
    >
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
              transform: `translateY(${dragOffset - keyboardInset}px)`,
              // 손을 뗀 뒤 제자리로 돌아갈 때만 전환을 건다. 항상 켜두면 키보드가 올라오는
              // 동안 시트가 visualViewport를 200ms씩 뒤늦게 쫓아가 그만큼 틈이 보인다.
              transition: isSnappingBack
                ? `transform ${SNAP_BACK_MS}ms ${SNAP_BACK_EASING}`
                : "none",
            } as React.CSSProperties
          }
          // 복귀가 끝나면 전환을 걷어낸다. 남겨두면 다음 키보드 이동이 이 전환을 탄다.
          // transitionend는 자식에서 버블링되므로, 본문 입력의 색 전환 하나가 끝나도
          // 여기로 올라온다 — 그걸 복귀 완료로 읽으면 복귀 애니메이션이 중간에 끊긴다.
          onTransitionEnd={(event) => {
            if (event.target !== event.currentTarget || event.propertyName !== "transform") return;
            setIsSnappingBack(false);
          }}
        >
          <DialogPrimitive.Close ref={closeRef} className="hidden" tabIndex={-1} aria-hidden />
          {/* 끌어서 닫는 영역은 여기(핸들+제목)뿐이다. 본문까지 잡으면 시트 안 세로 스크롤과
              드래그를 매번 구분해야 하는데, 위쪽만 쓰면 그 판단 자체가 필요 없다.
              touch-none이 없으면 브라우저가 스크롤로 가로채 pointermove가 끊긴다. */}
          <div
            className="touch-none select-none"
            onPointerDown={(event) => {
              // 두 번째 손가락이 닿으면 기준점을 덮어써 진행 중인 끌기가 튄다. 우클릭도 막는다.
              if (!event.isPrimary || event.button !== 0) return;
              event.currentTarget.setPointerCapture(event.pointerId);
              activePointerIdRef.current = event.pointerId;
              dragStartYRef.current = event.clientY;
              setIsSnappingBack(false);
            }}
            onPointerMove={(event) => {
              const startY = dragStartYRef.current;
              if (startY === null || event.pointerId !== activePointerIdRef.current) return;
              // 위로는 끌리지 않는다 — 시트는 이미 화면 아래에 붙어 있다.
              setDragOffset(Math.max(0, event.clientY - startY));
            }}
            onPointerUp={(event) => endDrag(event.pointerId, event.clientY)}
            // 취소는 OS가 제스처를 가져간 것이다(제어센터 스와이프, 전화 수신 등).
            // 사용자가 닫으려던 게 아니므로 임계값을 보지 않고 제자리로만 돌린다.
            onPointerCancel={(event) => endDrag(event.pointerId, null)}
          >
            <div className="flex justify-center pt-3 pb-2">
              <div className="h-1 w-9 rounded-full bg-gray-100" aria-hidden />
            </div>
            <DialogPrimitive.Title className="px-5 pt-2 text-title-t2-700 text-gray-900">
              {title}
            </DialogPrimitive.Title>
          </div>
          {children}
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
