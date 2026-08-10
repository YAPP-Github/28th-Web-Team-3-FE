import { Skeleton } from "@repo/ui";

interface OnboardingPageSkeletonProps {
  /** 화면을 읽어주는 이름. 무엇을 기다리는지 스크린리더에 알린다. */
  label: string;
}

/**
 * 온보딩 전체 화면 대기 뼈대 — 제목 한 줄 + 본문 카드 + 하단 CTA.
 *
 * 결과 화면과 목표 플랜 화면이 같은 골격(가운데 정렬 한 컬럼, 하단 고정 버튼)이라 함께 쓴다.
 * 가운데에 문구 한 줄만 띄우면 도착하는 순간 화면 전체가 위로 튄다.
 */
export function OnboardingPageSkeleton({ label }: OnboardingPageSkeletonProps) {
  return (
    <div
      aria-busy="true"
      aria-label={label}
      role="status"
      className="mx-auto flex min-h-dvh w-full max-w-md flex-col gap-6 px-5 pt-8 pb-6"
    >
      <Skeleton className="h-8 w-2/3 self-center" />
      <Skeleton className="h-5 w-1/2 self-center" />
      <Skeleton className="h-56 w-full rounded-2xl" />
      <Skeleton className="h-32 w-full rounded-2xl" />
      <Skeleton className="mt-auto h-[52px] w-full rounded-[12px]" />
    </div>
  );
}
