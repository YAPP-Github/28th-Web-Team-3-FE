"use client";

import * as Sentry from "@sentry/nextjs";
import type { ErrorInfo } from "next/error";
import { useEffect } from "react";
import { ErrorState, RetryButton } from "./_components/error-state";

export default function RouteError({ error, retry }: ErrorInfo) {
  useEffect(() => {
    // dev만 건너뛴다 — instrumentation-client.ts가 debug를 켜는 조건과 같다.
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
      // Next 16.3의 retry는 실패한 세그먼트를 다시 요청한다.
      action={<RetryButton onClick={retry} />}
    />
  );
}
