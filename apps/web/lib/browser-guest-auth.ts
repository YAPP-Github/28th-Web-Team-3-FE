import "client-only";

import { authTokensSchema } from "@repo/schema/auth";

const DEVICE_UUID_KEY = "ut_guest_device_uuid";
const AUTH_FETCH_TIMEOUT_MS = 10_000;

let accessToken: string | null = null;
let inflight: Promise<string | null> | null = null;

function getOrCreateDeviceUuid(): string {
  const stored = sessionStorage.getItem(DEVICE_UUID_KEY);
  if (stored) return stored;

  const uuid = crypto.randomUUID();
  sessionStorage.setItem(DEVICE_UUID_KEY, uuid);
  return uuid;
}

async function issueAccessToken(): Promise<string | null> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!apiUrl) return null;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), AUTH_FETCH_TIMEOUT_MS);

  try {
    const response = await fetch(new URL("auth/guest", apiUrl), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ uuid: getOrCreateDeviceUuid() }),
      signal: controller.signal,
    });
    if (!response.ok) return null;

    const tokens = authTokensSchema.parse(await response.json());
    accessToken = tokens.accessToken;
    return accessToken;
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

function issueSingleFlight(): Promise<string | null> {
  inflight ??= issueAccessToken().finally(() => {
    inflight = null;
  });
  return inflight;
}

export function getBrowserAccessToken(): Promise<string | null> {
  return accessToken ? Promise.resolve(accessToken) : issueSingleFlight();
}

export function refreshBrowserAccessToken(): Promise<string | null> {
  return issueSingleFlight();
}
