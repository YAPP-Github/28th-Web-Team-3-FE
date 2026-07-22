import type { ReactNode } from "react";
import { BottomNav } from "../_components/bottom-nav";

/** 바텀 네비가 항상 보이는 탭 라우트 그룹(홈·미션·혜택·마이). URL에는 영향 없음. */
export default function TabsLayout({ children }: { children: ReactNode }) {
  return (
    <>
      {children}
      <BottomNav />
    </>
  );
}
