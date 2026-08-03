"use client";

import { useQuery } from "@tanstack/react-query";
import { redirect, usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { LOADING_TEXT } from "@/lib/messages";
import { currentUserOptions } from "@/lib/queries/auth";

function isOnboardingPath(pathname: string | null): boolean {
  return pathname === "/onboarding" || pathname?.startsWith("/onboarding/") === true;
}

export function OnboardingRouteGuard({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { data: currentUser, error, isPending } = useQuery(currentUserOptions());
  const onboardingRoute = isOnboardingPath(pathname);

  if (isPending) {
    return <p className="px-5 pt-20 text-center text-body-b2-500 text-gray-400">{LOADING_TEXT}</p>;
  }

  if (error) throw error;
  if (!currentUser) throw new Error("현재 사용자 조회 결과가 없습니다.");

  if (currentUser.onboardingCompleted && onboardingRoute) redirect("/");
  if (!currentUser.onboardingCompleted && !onboardingRoute) redirect("/onboarding/intro");
  return children;
}
