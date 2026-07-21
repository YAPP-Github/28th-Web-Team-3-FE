"use client";

import { cn } from "@repo/ui";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { FC, SVGProps } from "react";
import BenefitIcon from "./icons/benefit.svg";
import HomeIcon from "./icons/home.svg";
import MissionIcon from "./icons/mission.svg";
import MyIcon from "./icons/my.svg";

const TABS: { label: string; href: string; Icon: FC<SVGProps<SVGSVGElement>> }[] = [
  { label: "홈", href: "/", Icon: HomeIcon },
  { label: "미션", href: "/mission", Icon: MissionIcon },
  { label: "혜택", href: "/benefits", Icon: BenefitIcon },
  { label: "마이", href: "/mypage", Icon: MyIcon },
];

export function BottomNav() {
  const pathname = usePathname() ?? "";

  return (
    <nav className="fixed inset-x-0 bottom-0 mx-auto max-w-md border-gray-100 border-t bg-gray-0 pb-[env(safe-area-inset-bottom)]">
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
