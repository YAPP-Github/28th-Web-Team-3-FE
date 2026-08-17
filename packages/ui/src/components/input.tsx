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
        // 포커스 표시는 다른 인터랙션 요소(Button/Toggle/Slider 등)와 같은 링 하나로 통일한다 —
        // 테두리 색과 링 색을 따로 바꾸면 서로 안 맞는 두 겹 선으로 보인다.
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        // 오류 표시는 `aria-invalid` 하나로 몰아 둔다 — 테두리 색과 스크린리더가 갈라지지 않는다.
        "aria-invalid:border-error aria-invalid:focus-visible:border-error aria-invalid:focus-visible:ring-error-light",
        className,
      )}
      {...props}
    />
  );
}
