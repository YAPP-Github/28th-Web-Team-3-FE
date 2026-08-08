import { z } from "zod";

/**
 * 게스트 인증 토큰 응답 — POST /api/auth/guest, POST /api/auth/guest/refresh 공통.
 * 네이티브(RN)가 응답 검증에 사용한다. 토큰은 웹으로 refreshToken을 넘기지 않는 것이 규칙.
 */
export const authTokensSchema = z.object({
  accessToken: z.string().min(1),
  refreshToken: z.string().min(1),
});

/** GET /api/auth/me 응답. */
export const currentUserSchema = z.object({
  userId: z.number().int(),
  onboardingCompleted: z.boolean(),
});

export type AuthTokens = z.infer<typeof authTokensSchema>;
export type CurrentUser = z.infer<typeof currentUserSchema>;
