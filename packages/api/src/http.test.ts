import type { KyInstance } from "ky";
import { describe, expect, it, vi } from "vitest";
import { z } from "zod";
import { createHttp } from "./http";

const responseSchema = z.object({ amount: z.number().int() });
const requestSchema = z.object({ savedAmountManwon: z.number().int().min(0) });

/** ky 인스턴스는 호출 가능한 함수다 — 옵션 기록용으로 그 부분만 흉내 낸다. */
function fakeClient(body: unknown = { amount: 5000 }) {
  const calls: { url: string; options: Record<string, unknown> }[] = [];
  const client = vi.fn((url: string, options: Record<string, unknown>) => {
    calls.push({ url, options });
    return Object.assign(Promise.resolve(undefined), { json: async () => body });
  });
  return { http: createHttp(client as unknown as KyInstance), calls, client };
}

describe("createHttp", () => {
  it("응답 계약을 주면 검증된 값을 돌려준다", async () => {
    const { http } = fakeClient();

    await expect(http.get("goal", { response: responseSchema })).resolves.toEqual({ amount: 5000 });
  });

  it("계약과 다른 응답은 던진다", async () => {
    const { http } = fakeClient({ amount: "5000" });

    await expect(http.get("goal", { response: responseSchema })).rejects.toThrow();
  });

  it("body는 ky의 json 옵션으로 옮겨 보낸다", async () => {
    const { http, calls } = fakeClient();

    await http.put("goal/savings", { body: { savedAmountManwon: 100 } });

    expect(calls[0]?.options).toMatchObject({
      method: "put",
      json: { savedAmountManwon: 100 },
    });
  });

  it("요청 계약을 주면 보내기 전에 검증한다", async () => {
    const { http, client } = fakeClient();

    await expect(
      http.put("goal/savings", { body: { savedAmountManwon: -1 }, request: requestSchema }),
    ).rejects.toThrow();
    expect(client).not.toHaveBeenCalled();
  });

  it("body가 없으면 json 옵션을 붙이지 않는다", async () => {
    const { http, calls } = fakeClient();

    await http.delete("missions/recommended/1");

    expect(calls[0]?.options).not.toHaveProperty("json");
    expect(calls[0]?.options).toMatchObject({ method: "delete" });
  });

  it("ky 옵션은 그대로 통과시킨다", async () => {
    const { http, calls } = fakeClient();
    const searchParams = new URLSearchParams({ categories: "MEAL" });

    await http.get("missions/surveys/questions", { searchParams, response: responseSchema });

    expect(calls[0]?.options).toMatchObject({ searchParams });
    expect(calls[0]?.options).not.toHaveProperty("response");
  });
});
