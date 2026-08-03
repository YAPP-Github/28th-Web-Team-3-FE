"use client";

import { useQuery } from "@tanstack/react-query";
import { usePathname, useRouter } from "next/navigation";
import { type ReactNode, useEffect } from "react";
import { LOADING_TEXT } from "@/lib/messages";
import { currentUserOptions } from "@/lib/queries/auth";

function isOnboardingPath(pathname: string | null): boolean {
  return pathname === "/onboarding" || pathname?.startsWith("/onboarding/") === true;
}

export function OnboardingRouteGuard({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: currentUser, error, isPending } = useQuery(currentUserOptions());
  const onboardingRoute = isOnboardingPath(pathname);

  const shouldRedirectToHome = currentUser?.onboardingCompleted === true && onboardingRoute;
  const shouldRedirectToOnboarding = currentUser?.onboardingCompleted === false && !onboardingRoute;

  useEffect(() => {
    if (shouldRedirectToHome) router.replace("/");
    if (shouldRedirectToOnboarding) router.replace("/onboarding/intro");
  }, [router, shouldRedirectToHome, shouldRedirectToOnboarding]);

  if (isPending) {
    return <p className="px-5 pt-20 text-center text-body-b2-500 text-gray-400">{LOADING_TEXT}</p>;
  }

  if (error) throw error;
  if (!currentUser) throw new Error("현재 사용자 조회 결과가 없습니다.");

  if (shouldRedirectToHome || shouldRedirectToOnboarding) {
    return <p className="px-5 pt-20 text-center text-body-b2-500 text-gray-400">{LOADING_TEXT}</p>;
  }

  return children;
}
