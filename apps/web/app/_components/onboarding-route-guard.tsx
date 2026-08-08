"use client";

import { useQuery } from "@tanstack/react-query";
import { usePathname, useRouter } from "next/navigation";
import { type ReactNode, useEffect } from "react";
import { LOADING_TEXT } from "@/lib/messages";
import { currentUserOptions } from "@/lib/queries/auth";

function isOnboardingPath(pathname: string | null): boolean {
  return pathname === "/onboarding" || pathname?.startsWith("/onboarding/") === true;
}

/**
 * 인증 없이 열려야 하는 경로.
 *
 * 약관·개인정보처리방침 URL은 스토어에 제출해 심사자가 브라우저에서 연다. 그쪽에는 토큰이
 * 없어(기기 uuid·refresh는 네이티브 SecureStore에만 있다) `/api/auth/me`가 401이 되는데,
 * 가드가 그걸 그대로 던지면 문서 대신 오류 화면을 보게 된다.
 */
function isPublicPath(pathname: string | null): boolean {
  return pathname === "/legal" || pathname?.startsWith("/legal/") === true;
}

export function OnboardingRouteGuard({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const publicRoute = isPublicPath(pathname);
  // 공개 경로에서는 조회 자체를 하지 않는다 — 어차피 401이고, 결과를 쓸 일도 없다.
  const {
    data: currentUser,
    error,
    isPending,
  } = useQuery({
    ...currentUserOptions(),
    enabled: !publicRoute,
  });
  const onboardingRoute = isOnboardingPath(pathname);
  const redirectPath =
    !publicRoute && !isPending && !error && currentUser
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

  // 공개 경로는 조회 결과를 기다리지도, 실패를 문제 삼지도 않는다.
  if (publicRoute) return children;

  if (isPending || redirectPath) {
    return <p className="px-5 pt-20 text-center text-body-b2-500 text-gray-400">{LOADING_TEXT}</p>;
  }

  if (error) throw error;
  if (!currentUser) throw new Error("현재 사용자 조회 결과가 없습니다.");

  return children;
}
