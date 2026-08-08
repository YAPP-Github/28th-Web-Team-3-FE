import type * as React from "react";
import { cn } from "../lib/utils";

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

export function Input({ className, type, ...props }: InputProps) {
  return (
    <input
      type={type}
      className={cn(
        "h-[52px] w-full rounded-xl border border-gray-100 px-4 text-body-b1-500 text-gray-900",
        "placeholder:text-gray-200 disabled:cursor-not-allowed disabled:opacity-50",
        "focus-visible:border-gray-800 focus-visible:ring-2 focus-visible:ring-gray-100 focus-visible:outline-none",
        // 오류 표시는 `aria-invalid` 하나로 몰아 둔다 — 테두리 색과 스크린리더가 갈라지지 않는다.
        "aria-invalid:border-error aria-invalid:focus-visible:border-error aria-invalid:focus-visible:ring-error-light",
        className,
      )}
      {...props}
    />
  );
}
