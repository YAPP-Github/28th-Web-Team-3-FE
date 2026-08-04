import type { ReactNode } from "react";
import { BottomNav } from "@/app/_components/bottom-nav";

/**
 * 바텀 네비가 항상 보이는 탭 라우트 그룹(홈·미션·혜택·마이). URL에는 영향 없음.
 * 네비는 fixed라 가려지는 만큼의 하단 여백을 여기서 한 번만 준다 — 높이가 바뀌면 이 한 곳만
 * 고치면 된다. 홈 인디케이터·제스처바만큼의 여백은 네이티브 셸(`App.tsx`의 `SafeAreaView`)이
 * 잡으므로 여기에 `env(safe-area-inset-bottom)`을 더하지 않는다 — 더하면 이중 여백이다.
 *
 * 폭 제한(`max-w-md`)도 여기서 한 번만 준다 — 네비가 같은 폭으로 고정돼 있으므로 본문이
 * 어긋나지 않으려면 값이 한 곳에서만 정의돼야 한다. 각 페이지는 `flex-1`로 남은 높이를 채운다.
 */
export default function TabsLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col pb-24">{children}</div>
      <BottomNav />
    </>
  );
}
