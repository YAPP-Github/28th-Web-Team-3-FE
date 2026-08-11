import * as Sentry from "@sentry/nextjs";
import { HTTPError, NetworkError, TimeoutError } from "ky";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { z } from "zod";
import { reportGoalStatusError } from "./report-goal-status-error";

vi.mock("@sentry/nextjs", () => ({ captureException: vi.fn() }));

beforeEach(() => vi.clearAllMocks());

function capturedContext() {
  return vi.mocked(Sentry.captureException).mock.calls[0]?.[1];
}

function httpError(data: unknown) {
  const request = new Request("https://example.com/api/goal", {
    headers: { Authorization: "Bearer secret-token" },
  });
  const error = new HTTPError(new Response(null, { status: 503 }), request, {} as never);
  error.data = data;
  return error;
}

describe("reportGoalStatusError", () => {
  it("HTTP 상태와 정형화된 백엔드 오류 이름만 보고하고 원본 요청은 넘기지 않는다", () => {
    const error = httpError({
      name: "GOAL_TEMPORARILY_UNAVAILABLE",
      message: "sensitive detail",
    });

    reportGoalStatusError(error);

    const capturedError = vi.mocked(Sentry.captureException).mock.calls[0]?.[0];
    expect(capturedError).not.toBe(error);
    expect(capturedError).toMatchObject({ name: "GoalStatusError" });
    expect(capturedContext()).toEqual({
      tags: {
        feature: "goal-status",
        error_kind: "http",
        http_status: "503",
        backend_error_name: "GOAL_TEMPORARILY_UNAVAILABLE",
      },
      extra: {},
    });
    expect(JSON.stringify(capturedContext())).not.toContain("secret-token");
    expect(JSON.stringify(capturedContext())).not.toContain("sensitive detail");
  });

  it("임의 문자열인 백엔드 오류 이름은 보고하지 않는다", () => {
    reportGoalStatusError(httpError({ name: "user@example.com" }));

    expect(capturedContext()).toEqual({
      tags: { feature: "goal-status", error_kind: "http", http_status: "503" },
      extra: {},
    });
  });

  it("스키마 오류는 값 없이 코드와 필드 경로만 보고한다", () => {
    const error = z.object({ thisMonth: z.object({ dDay: z.number() }) }).safeParse({
      thisMonth: { dDay: "secret-value" },
    }).error;

    reportGoalStatusError(error);

    expect(capturedContext()).toEqual({
      tags: { feature: "goal-status", error_kind: "schema" },
      extra: {
        schemaIssues: [{ code: "invalid_type", path: "thisMonth.dDay" }],
      },
    });
    expect(JSON.stringify(capturedContext())).not.toContain("secret-value");
  });

  it("네트워크 오류를 별도 종류로 분류한다", () => {
    const request = new Request("https://example.com/api/goal", {
      headers: { Authorization: "Bearer secret-token" },
    });

    reportGoalStatusError(new NetworkError(request));

    expect(capturedContext()).toEqual({
      tags: { feature: "goal-status", error_kind: "network" },
      extra: {},
    });
  });

  it("타임아웃을 일반 네트워크 오류와 구분한다", () => {
    reportGoalStatusError(new TimeoutError(new Request("https://example.com/api/goal")));

    expect(capturedContext()).toEqual({
      tags: { feature: "goal-status", error_kind: "timeout" },
      extra: {},
    });
  });
});
