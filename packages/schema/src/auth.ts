import { z } from "zod";

/**
 * 게스트 인증 토큰 응답 — POST /api/auth/guest, POST /api/auth/guest/refresh 공통.
 * 네이티브(RN)가 응답 검증에 사용한다. 토큰은 웹으로 refreshToken을 넘기지 않는 것이 규칙.
 */
export const authTokensSchema = z.object({
  accessToken: z.string().min(1),
  refreshToken: z.string().min(1),
  /** access token 만료까지 남은 시간(초). 백엔드가 생략할 수 있다. */
  expiresIn: z.number().int().positive().optional(),
});

export type AuthTokens = z.infer<typeof authTokensSchema>;
