import { cva, type VariantProps } from "class-variance-authority";
import type * as React from "react";
import { cn } from "../lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors disabled:pointer-events-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground hover:bg-primary/90 disabled:bg-secondary disabled:text-gray-300",
        secondary: "bg-secondary text-gray-700 hover:bg-secondary/80 disabled:opacity-50",
        destructive: "bg-destructive text-white hover:bg-destructive/90 disabled:opacity-50",
        outline: "border border-input bg-background hover:bg-secondary disabled:opacity-50",
        ghost: "hover:bg-secondary disabled:opacity-50",
        // 온보딩 이전 버튼
        onboardingBack: "bg-gray-900 text-gray-0 hover:bg-gray-900/90 disabled:opacity-50",
        // 온보딩 다음 버튼
        onboardingNext:
          "bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-6",
        // 아이콘 단독 버튼(헤더 뒤로가기 등) — 44px는 터치 타깃 최소치다.
        icon: "size-11 rounded-full",
        // 하단 CTA("다음"/"적용" 등 앞으로가기 역할) — 풀너비.
        cta: "w-full rounded-[12px] py-[14px]",
        // 이전 API 호환용 alias.
        full: "w-full rounded-[12px] py-[14px]",
        // 플로팅 버튼 (온보딩 하단 페이지 이동 버튼)
        floating: "h-12.5 w-12.5 rounded-full",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

// `type`을 기본 "button"으로 둔다 — 폼 안에서 <button>의 기본값은 submit이라, 지정을
// 빠뜨리면 아무 버튼이나 폼을 제출한다.
export function Button({ className, variant, size, type = "button", ...props }: ButtonProps) {
  return (
    <button className={cn(buttonVariants({ variant, size }), className)} type={type} {...props} />
  );
}

export { buttonVariants };
