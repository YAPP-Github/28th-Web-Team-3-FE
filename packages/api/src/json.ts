import type { ResponsePromise } from "ky";
import type { ZodType } from "zod";

/**
 * 응답 JSON을 스키마로 검증해 돌려준다.
 *
 * `schema.parse(await api.get(...).json())`은 안에서 밖으로 읽히고 `await` 위치도 매번 달라진다.
 * 요청과 계약을 나란히 두어 호출 순서대로 읽히게 한다.
 *
 * @example
 * return parseJson(api.get("goal"), goalStatusSchema);
 */
export async function parseJson<T>(request: ResponsePromise, schema: ZodType<T>): Promise<T> {
  return schema.parse(await request.json());
}
