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
  const redirectPath =
    !isPending && !error && currentUser
      ? currentUser.onboardingCompleted && onboardingRoute
        ? "/"
        : !currentUser.onboardingCompleted && !onboardingRoute
          ? "/onboarding/intro"
          : null
      : null;

  // Client Component가 렌더 중 redirect를 던지면 현재 사용자 캐시 갱신과 페이지의
  // router.replace가 겹쳐 React 렌더가 중단될 수 있다. Hook 호출을 항상 끝낸 뒤 이동한다.
  useEffect(() => {
    if (redirectPath) router.replace(redirectPath);
  }, [redirectPath, router]);

  if (isPending || redirectPath) {
    return <p className="px-5 pt-20 text-center text-body-b2-500 text-gray-400">{LOADING_TEXT}</p>;
  }

  if (error) throw error;
  if (!currentUser) throw new Error("현재 사용자 조회 결과가 없습니다.");

  return children;
}
