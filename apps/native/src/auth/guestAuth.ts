import { type AuthTokens, authTokensSchema } from "@repo/schema/auth";
import * as Crypto from "expo-crypto";
import * as SecureStore from "expo-secure-store";
import { API_URL } from "../config";

/**
 * 게스트 인증 관리자. 서버 계약:
 *   POST /auth/guest          { uuid }         → { accessToken, refreshToken, expiresIn }
 *   POST /auth/guest/refresh  { refreshToken } → { accessToken, refreshToken, expiresIn } (rotation)
 *
 * 원칙:
 *  - 기기 uuid는 최초 1회 생성해 SecureStore에 영구 보관. 서버가 hash(uuid)로 게스트를
 *    식별하므로, refresh token까지 만료돼도 같은 uuid로 재발급하면 같은 계정으로 복귀한다.
 *  - refreshToken은 SecureStore(키체인)에만 저장하고 웹(WebView)으로 절대 넘기지 않는다.
 *  - accessToken은 RN 메모리에만 유지. 웹은 bridge.getAccessToken()으로 당겨 간다(pull).
 *  - 발급/갱신은 single-flight — 동시에 여러 401이 몰려도 서버 호출은 1회.
 *  - 토큰 값은 자격증명이므로 로그/Sentry에 남기지 않는다.
 */

const UUID_KEY = "guest_device_uuid";
const REFRESH_TOKEN_KEY = "guest_refresh_token";

let accessToken: string | null = null;
let inflight: Promise<string | null> | null = null;

async function getOrCreateDeviceUuid(): Promise<string> {
  const stored = await SecureStore.getItemAsync(UUID_KEY);
  if (stored) return stored;
  const uuid = Crypto.randomUUID();
  await SecureStore.setItemAsync(UUID_KEY, uuid, {
    keychainAccessible: SecureStore.WHEN_UNLOCKED,
  });
  return uuid;
}

// 응답이 영영 안 오는 요청이 single-flight `inflight`를 무한 점유하면 앱 재시작까지
// 인증이 막힌다 — 타임아웃으로 반드시 settle시켜 finally가 상태를 비우게 한다.
const AUTH_FETCH_TIMEOUT_MS = 10_000;

async function postAuth(
  path: "/auth/guest" | "/auth/guest/refresh",
  body: Record<string, string>,
): Promise<AuthTokens | "rejected" | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), AUTH_FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(`${API_URL}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
    // "rejected"(4xx: 만료·무효·차단)만 uuid 재발급으로 복구 가능한 실패로 취급.
    // 단 429(rate limit)·408(timeout)은 일시 장애 — 즉시 신규 발급으로 이어가면
    // 제한 걸린 서버에 요청만 보태므로 null로 끝내고 다음 요청에서 자연 재시도.
    // 백엔드 에러 코드 계약이 확정되면 4xx 안에서 코드별 분기를 추가한다.
    if (!res.ok) {
      if (res.status === 429 || res.status === 408) return null;
      return res.status < 500 ? "rejected" : null;
    }
    return authTokensSchema.parse(await res.json());
  } catch {
    // 네트워크/파싱/타임아웃 실패. 응답에 토큰이 섞일 수 있으므로 상세 내용은 로그로 남기지 않는다.
    return null;
  } finally {
    clearTimeout(timer);
  }
}

async function reissue(): Promise<string | null> {
  const refreshToken = await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
  let result = refreshToken
    ? await postAuth("/auth/guest/refresh", { refreshToken })
    : ("rejected" as const);
  // refresh가 거부됐을 때(만료·무효·부재)만 같은 uuid로 신규 발급해 계정 복귀.
  // 5xx·네트워크·파싱 실패는 같은 서버라 fallback이 무의미 — null로 끝내고
  // 다음 요청에서 자연 재시도한다.
  if (result === "rejected") {
    const uuid = await getOrCreateDeviceUuid();
    result = await postAuth("/auth/guest", { uuid });
  }
  if (result === "rejected" || result === null) return null;
  const tokens = result;

  // 새 accessToken을 내주기 전에 rotation된 refreshToken 저장을 반드시 끝낸다 —
  // 저장 전에 앱이 죽으면 폐기된 구 refreshToken만 남아 다음 부트가 신규 발급으로 빠진다.
  await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, tokens.refreshToken, {
    keychainAccessible: SecureStore.WHEN_UNLOCKED,
  });
  accessToken = tokens.accessToken;
  return accessToken;
}

function reissueSingleFlight(): Promise<string | null> {
  inflight ??= reissue()
    .catch(() => null)
    .finally(() => {
      inflight = null;
    });
  return inflight;
}

/** 부트 시 1회 호출: refresh 갱신 또는 신규 발급. 실패해도 앱 진입은 막지 않는다. */
export function initGuestAuth(): Promise<string | null> {
  return reissueSingleFlight();
}

/** bridge.getAccessToken 구현 — 메모리 토큰 반환, 없으면 발급 시도. */
export function getAccessToken(): Promise<string | null> {
  return accessToken ? Promise.resolve(accessToken) : reissueSingleFlight();
}

/** bridge.refreshAccessToken 구현 — 웹이 401을 받았을 때 호출. */
export function refreshAccessToken(): Promise<string | null> {
  return reissueSingleFlight();
}
