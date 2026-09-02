"use client";

import * as Sentry from "@sentry/nextjs";
import type { ErrorInfo } from "next/error";
import { useEffect } from "react";

import { ErrorState, RetryButton } from "./_components/error-state";
import "./globals.css";

export default function GlobalError({ error, retry }: ErrorInfo) {
  useEffect(() => {
    // error.tsx와 같은 조건. 두 경계가 갈리면 어느 빌드에서 무엇이 보고됐는지 알 수 없다.
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
          action={<RetryButton onClick={retry} />}
        />
      </body>
    </html>
  );
}
