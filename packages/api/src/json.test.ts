import { describe, expect, it } from "vitest";
import { z } from "zod";
import { parseJson } from "./json";

const schema = z.object({ amount: z.number().int() });

/** ky의 ResponsePromise는 `.json()`만 쓰므로 그 부분만 흉내 낸다. */
function responsePromise(body: unknown) {
  return { json: async () => body } as unknown as Parameters<typeof parseJson>[0];
}

describe("parseJson", () => {
  it("응답 JSON을 스키마로 검증해 돌려준다", async () => {
    await expect(parseJson(responsePromise({ amount: 5000 }), schema)).resolves.toEqual({
      amount: 5000,
    });
  });

  it("계약과 다른 응답은 던진다", async () => {
    await expect(parseJson(responsePromise({ amount: "5000" }), schema)).rejects.toThrow();
  });

  it("요청이 실패하면 그 에러를 그대로 전파한다", async () => {
    const failing = {
      json: async () => Promise.reject(new Error("network")),
    } as unknown as Parameters<typeof parseJson>[0];

    await expect(parseJson(failing, schema)).rejects.toThrow("network");
  });
});
