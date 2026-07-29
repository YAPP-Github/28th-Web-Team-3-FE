"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";

import { ErrorState, RetryButton } from "./_components/error-state";

export default function GlobalError({
  error,
  reset,
  retry,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  reset?: () => void;
  retry?: () => void;
  unstable_retry?: () => void;
}) {
  useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      return;
    }

    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="ko">
      <body>
        <ErrorState
          title="문제가 생겼어요"
          description="앱을 불러오지 못했어요. 다시 시도해 주세요."
          action={<RetryButton onClick={retry ?? unstable_retry ?? reset ?? (() => {})} />}
        />
      </body>
    </html>
  );
}
