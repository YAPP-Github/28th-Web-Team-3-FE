import * as Sentry from "@sentry/nextjs";
import { isHTTPError, isNetworkError, isTimeoutError } from "ky";
import { ZodError } from "zod";

type ErrorKind = "http" | "network" | "schema" | "timeout" | "unknown";

const BACKEND_ERROR_NAME_PATTERN = /^[A-Z][A-Z0-9_]{0,99}$/;

function getBackendErrorName(data: unknown): string | undefined {
  if (typeof data !== "object" || data === null || !("name" in data)) return undefined;
  return typeof data.name === "string" && BACKEND_ERROR_NAME_PATTERN.test(data.name)
    ? data.name
    : undefined;
}

/**
 * 목표 조회 실패를 민감 정보 없이 보고한다.
 *
 * ky 오류 원본에는 Authorization 헤더가 든 Request가 있으므로 그대로 Sentry에 넘기지 않는다.
 * 대신 실패 종류·HTTP 상태·Zod 경로만 새 Error의 컨텍스트로 기록한다.
 */
export function reportGoalStatusError(error: unknown): void {
  let kind: ErrorKind = "unknown";
  const tags: Record<string, string> = { feature: "goal-status" };
  const extra: Record<string, unknown> = {};

  if (isHTTPError(error)) {
    kind = "http";
    tags.http_status = String(error.response.status);
    const backendErrorName = getBackendErrorName(error.data);
    if (backendErrorName) tags.backend_error_name = backendErrorName;
  } else if (isTimeoutError(error)) {
    kind = "timeout";
  } else if (isNetworkError(error) || error instanceof TypeError) {
    kind = "network";
  } else if (error instanceof ZodError) {
    kind = "schema";
    extra.schemaIssues = error.issues.map(({ code, path }) => ({
      code,
      path: path.join("."),
    }));
  }

  tags.error_kind = kind;
  const safeError = new Error("Goal status query failed");
  safeError.name = "GoalStatusError";
  Sentry.captureException(safeError, { tags, extra });
}
