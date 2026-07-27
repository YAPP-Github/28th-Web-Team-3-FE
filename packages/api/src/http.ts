import type { KyInstance, Options } from "ky";
import type { ZodType } from "zod";

/**
 * 요청 옵션. ky 옵션을 그대로 받되(`searchParams`·`signal`·`headers` 등) 아래 세 개를 더한다.
 *
 * - `body` — 보낼 값. ky의 `json` 대신 이 키를 쓴다(호출부에서 직렬화 방식이 드러나지 않게).
 * - `request` — 보내기 전 계약 검증. 서버 왕복 없이 위반을 잡는다.
 * - `response` — 받은 뒤 계약 검증. 주면 검증된 값을 돌려주고, 없으면 응답을 읽지 않는다.
 */
export type RequestOptions<TBody, TResponse> = Omit<Options, "body" | "json" | "method"> & {
  body?: TBody;
  request?: ZodType<TBody>;
  response?: ZodType<TResponse>;
};

type WithResponse<TBody, TResponse> = RequestOptions<TBody, TResponse> & {
  response: ZodType<TResponse>;
};
type WithoutResponse<TBody> = Omit<RequestOptions<TBody, never>, "response">;

/** 응답 계약을 주면 검증된 값을, 안 주면 void를 돌려준다. */
export interface ApiRequest {
  <TBody, TResponse>(url: string, options: WithResponse<TBody, TResponse>): Promise<TResponse>;
  <TBody>(url: string, options?: WithoutResponse<TBody>): Promise<void>;
}

type HttpMethod = "get" | "post" | "put" | "patch" | "delete";

function createRequest(client: KyInstance, method: HttpMethod): ApiRequest {
  return (async (url: string, options: RequestOptions<unknown, unknown> = {}) => {
    const { body, request, response, ...kyOptions } = options;
    const payload = request ? request.parse(body) : body;
    const sent = client(url, {
      ...kyOptions,
      method,
      ...(payload === undefined ? {} : { json: payload }),
    });

    // 응답 계약이 없으면 본문을 읽지 않는다 — 204처럼 body가 없는 응답이 대부분이다.
    if (!response) {
      await sent;
      return;
    }
    return response.parse(await sent.json());
  }) as ApiRequest;
}

/**
 * 스키마를 아는 HTTP 클라이언트. 모든 메서드가 `(url, options?)` 한 가지 모양이라
 * body가 없는 요청에 자리표시자를 넣을 일이 없다.
 *
 * @example
 * http.get("goal", { response: goalStatusSchema });
 * http.put("goal/savings", { body, request: savingRequestSchema });
 * http.delete(`missions/recommended/${missionId}`);
 */
export function createHttp(client: KyInstance) {
  return {
    get: createRequest(client, "get"),
    post: createRequest(client, "post"),
    put: createRequest(client, "put"),
    patch: createRequest(client, "patch"),
    delete: createRequest(client, "delete"),
  };
}

export type Http = ReturnType<typeof createHttp>;
