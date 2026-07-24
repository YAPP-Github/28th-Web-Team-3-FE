"use client";

import { type ReactNode, useEffect, useState } from "react";

/**
 * 개발 환경 MSW 부트스트랩. worker.start()가 끝날 때까지 자식 렌더를 보류한다 —
 * 준비 전에 첫 데이터 요청이 나가면 worker가 못 잡아 실제 네트워크로 새는 것을 막는다.
 */
export function MSWProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let active = true;
    import("@/mocks/browser")
      .then(({ worker }) => worker.start({ onUnhandledRequest: "bypass" }))
      .then(() => {
        if (active) setReady(true);
      });
    return () => {
      active = false;
    };
  }, []);

  if (!ready) return null;
  return children;
}
