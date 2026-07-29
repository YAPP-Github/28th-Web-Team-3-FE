"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";
import { ErrorState, RetryButton } from "./_components/error-state";

export default function RouteError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      return;
    }

    Sentry.captureException(error);
  }, [error]);

  return (
    <ErrorState
      title="문제가 생겼어요"
      description="화면을 불러오지 못했어요. 다시 시도해 주세요."
      action={<RetryButton onClick={reset} />}
    />
  );
}
