import type * as React from "react";
import { cn } from "../lib/utils";

export type TextButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement>;

/**
 * 밑줄 텍스트 버튼 (예: 슬라이더 화면의 "직접 입력" — 바텀시트 진입 트리거).
 */
export function TextButton({ className, type = "button", ...props }: TextButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        "text-body-b2-400 text-gray-700 underline underline-offset-2 transition-colors hover:text-gray-900",
        "disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        className,
      )}
      {...props}
    />
  );
}
