"use client";

import * as Sentry from "@sentry/nextjs";
import { useState } from "react";

class SentryFrontendTestError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SentryFrontendTestError";
  }
}

export default function SentryExamplePage() {
  const [hasSentError, setHasSentError] = useState(false);

  const handleTriggerError = async () => {
    // Wrap in a span so the error shows up alongside a trace in Sentry.
    await Sentry.startSpan({ name: "Example Frontend/Backend Span", op: "test" }, async () => {
      const res = await fetch("/api/sentry-example-api");
      if (!res.ok) {
        setHasSentError(true);
        throw new SentryFrontendTestError("프론트엔드 테스트 에러 — Sentry 연동 확인용 (새 유형).");
      }
    });
  };

  return (
    <main style={{ maxWidth: 480, margin: "10vh auto", padding: 24, fontFamily: "sans-serif" }}>
      <h1>Sentry Example</h1>
      <p>
        아래 버튼을 누르면 프론트엔드 + 백엔드(API) 양쪽에서 의도적으로 에러를 발생시켜 Sentry로
        전송합니다.
      </p>
      <button
        type="button"
        onClick={handleTriggerError}
        style={{
          padding: "10px 16px",
          fontSize: 16,
          cursor: "pointer",
          borderRadius: 8,
          border: "1px solid currentColor",
        }}
      >
        Throw Sample Error
      </button>
      {hasSentError && (
        <p style={{ marginTop: 16 }}>에러를 전송했습니다. Sentry Issues 대시보드에서 확인하세요.</p>
      )}
    </main>
  );
}
