"use client";

import { cn } from "@repo/ui";
import BenefitIcon from "@repo/ui/svg/bottom-nav-benefit.svg";
import HomeIcon from "@repo/ui/svg/bottom-nav-home.svg";
import MissionIcon from "@repo/ui/svg/bottom-nav-mission.svg";
import MyIcon from "@repo/ui/svg/bottom-nav-my.svg";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { FC, SVGProps } from "react";

const TABS: { label: string; href: string; Icon: FC<SVGProps<SVGSVGElement>> }[] = [
  { label: "홈", href: "/", Icon: HomeIcon },
  { label: "미션", href: "/mission", Icon: MissionIcon },
  { label: "혜택/팁", href: "/benefits", Icon: BenefitIcon },
  { label: "마이", href: "/mypage", Icon: MyIcon },
];

export function BottomNav() {
  const pathname = usePathname() ?? "";

  return (
    // 하단 인셋(홈 인디케이터·제스처바)은 네이티브 셸의 `SafeAreaBands`가 잡는다. 여기서
    // `env(safe-area-inset-bottom)`을 더하면 여백이 이중으로 들어간다.
    //
    // z-40은 본문 위, 모달 아래다. z-index를 비워두면 `auto`가 되는데, 그러면 본문의
    // z-10 요소(혜택 카드 저장 별 등)가 밑으로 스크롤돼 들어올 때 네비를 뚫고 그려진다 —
    // 양수 z를 가진 요소가 z-auto인 요소보다 나중에 칠해지기 때문이다. 시트·다이얼로그는
    // z-50이라 네비를 계속 덮는다.
    // 혜택 화면에는 필터 칩도 nav다(그쪽은 "혜택 필터"로 이름이 있다). 랜드마크가 둘인데
    // 한쪽만 무명이면 목록에서 무엇인지 알 수 없다.
    <nav
      aria-label="주요 메뉴"
      className="fixed inset-x-0 bottom-0 z-40 mx-auto max-w-md border-gray-100 border-t bg-gray-0"
    >
      <ul className="flex">
        {TABS.map(({ label, href, Icon }) => {
          const active =
            href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);
          return (
            <li key={href} className="flex-1">
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex flex-col items-center gap-1 py-3",
                  active ? "text-gray-800" : "text-gray-300",
                )}
              >
                <Icon className="size-6" aria-hidden="true" />
                <span className="text-caption-c1-500">{label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
