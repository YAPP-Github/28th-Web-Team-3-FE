import type * as React from "react";
import { cn } from "../lib/utils";

export type SkeletonProps = React.HTMLAttributes<HTMLDivElement>;

/**
 * 조회를 기다리는 동안 들어갈 자리를 실제 콘텐츠 모양으로 채우는 회색 블록.
 *
 * "불러오는 중…" 같은 문구 대신 쓴다. 문구는 화면이 어떻게 생겼는지 알려주지 않아서
 * 데이터가 도착하는 순간 레이아웃이 통째로 밀린다.
 *
 * 스크린리더에는 읽히지 않게 둔다 — 뼈대는 볼거리지 읽을거리가 아니다. 대기 중이라는
 * 사실은 이 블록들을 감싸는 영역이 `aria-busy`로 알린다.
 */
export function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      aria-hidden
      className={cn(
        "animate-pulse rounded-md bg-gray-50 motion-reduce:animate-none",
        // 움직임을 끈 사용자에게는 깜빡임 대신 옅은 회색 면만 남는다.
        className,
      )}
      {...props}
    />
  );
}
