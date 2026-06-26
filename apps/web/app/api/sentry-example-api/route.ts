export const dynamic = "force-dynamic";

class SentryExampleAPIError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SentryExampleAPIError";
  }
}

// Throws on purpose so Sentry can capture a server-side error.
export function GET() {
  throw new SentryExampleAPIError(
    "This error is raised on the backend called by the example page.",
  );
}
