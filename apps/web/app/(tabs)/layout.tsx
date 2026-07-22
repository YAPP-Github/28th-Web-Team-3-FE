import type { ReactNode } from "react";
import { BottomNav } from "@/app/_components/bottom-nav";

/**
 * 바텀 네비가 항상 보이는 탭 라우트 그룹(홈·미션·혜택·마이). URL에는 영향 없음.
 * 네비는 fixed라 가려지는 만큼의 하단 여백(pb-24)을 여기서 한 번만 준다 — 높이가 바뀌면
 * 이 한 곳만 고치면 된다. 각 페이지는 `flex-1`로 남은 높이를 채운다.
 */
export default function TabsLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <div className="flex min-h-dvh flex-col pb-24">{children}</div>
      <BottomNav />
    </>
  );
}
