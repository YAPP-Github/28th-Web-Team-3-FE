import { ChevronRight } from "lucide-react";
import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";

function RowBody({ children }: { children: ReactNode }) {
  return (
    <span className="flex items-center justify-between py-3">
      <span className="text-body-b1-500 text-gray-900">{children}</span>
      <ChevronRight className="size-6 text-gray-400" strokeWidth={1.6} aria-hidden />
    </span>
  );
}

/** 내부 라우트로 이동하는 설정 행 (이용약관·개인정보처리방침). */
export function SettingLinkRow({ children, ...props }: ComponentProps<typeof Link>) {
  return (
    <Link {...props}>
      <RowBody>{children}</RowBody>
    </Link>
  );
}

/** 액션을 실행하는 설정 행 (문의하기 — 바텀시트 열기). */
export function SettingButtonRow({ children, ...props }: ComponentProps<"button">) {
  return (
    <button type="button" className="w-full text-left" {...props}>
      <RowBody>{children}</RowBody>
    </button>
  );
}
