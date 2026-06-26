"use client";

import * as Sentry from "@sentry/nextjs";
import NextError from "next/error";
import { useEffect } from "react";

export default function GlobalError({ error }: { error: Error & { digest?: string } }) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="ko">
      <body>
        {/* NextError needs a statusCode; 0 renders a generic client-side message. */}
        <NextError statusCode={0} />
      </body>
    </html>
  );
}
