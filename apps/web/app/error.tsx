"use client";

import * as Sentry from "@sentry/nextjs";
import type { ErrorInfo } from "next/error";
import { useEffect } from "react";
import { ErrorState, RetryButton } from "./_components/error-state";

export default function RouteError({ error, unstable_retry }: ErrorInfo) {
  useEffect(() => {
    // dev만 건너뛴다 — sentry.server.config.ts·instrumentation-client.ts와 같은 조건이다.
    // `next build`가 NODE_ENV를 production으로 고정하므로 preview 배포도 여기 포함된다.
    if (process.env.NODE_ENV === "development") {
      return;
    }

    Sentry.captureException(error);
  }, [error]);

  return (
    <ErrorState
      title="문제가 생겼어요"
      description="화면을 불러오지 못했어요. 다시 시도해 주세요."
      // unstable_retry는 실패한 세그먼트를 다시 그린다. reset은 경계 상태만 되돌려
      // 같은 에러가 곧바로 재발할 수 있다.
      action={<RetryButton onClick={unstable_retry} />}
    />
  );
}
