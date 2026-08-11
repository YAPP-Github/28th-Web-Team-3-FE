import { ChevronRight } from "lucide-react";
import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";

/** 설정 행 한 줄. 높이 44px는 시안 값이자 터치 목표 최소치다. */
function RowBody({ children, trailing }: { children: ReactNode; trailing?: ReactNode }) {
  return (
    <span className="flex h-11 items-center justify-between">
      <span className="text-body-b1-500 text-gray-900">{children}</span>
      {trailing}
    </span>
  );
}

/** 내부 라우트로 이동하는 설정 행 (이용약관·개인정보처리방침). */
export function SettingLinkRow({ children, ...props }: ComponentProps<typeof Link>) {
  return (
    <Link {...props}>
      <RowBody
        trailing={<ChevronRight className="size-5 text-gray-400" strokeWidth={1.6} aria-hidden />}
      >
        {children}
      </RowBody>
    </Link>
  );
}

/**
 * 액션을 실행하는 설정 행 (문의하기 — 바텀시트 열기).
 * 시안이 화살표를 두지 않았다 — 화살표는 다른 화면으로 넘어간다는 표시라 시트에는 안 맞는다.
 */
export function SettingButtonRow({ children, ...props }: ComponentProps<"button">) {
  return (
    <button type="button" className="w-full text-left" {...props}>
      <RowBody>{children}</RowBody>
    </button>
  );
}
