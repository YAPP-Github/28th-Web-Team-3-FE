import { z } from "zod";

/**
 * 게스트 인증 토큰 응답 — POST /auth/guest, POST /auth/guest/refresh 공통.
 * 네이티브(RN)가 응답 검증에 사용한다. 토큰은 웹으로 refreshToken을 넘기지 않는 것이 규칙.
 */
export const authTokensSchema = z.object({
  accessToken: z.string().min(1),
  refreshToken: z.string().min(1),
  /** access token 만료까지 남은 시간(초). */
  expiresIn: z.number().int().positive(),
});

export type AuthTokens = z.infer<typeof authTokensSchema>;
