/**
 * 브릿지 계약 — 웹과 네이티브가 공유하는 단일 원본.
 *
 * 이 파일은 Expo·React Native import가 전혀 없어서 양쪽 다 의존할 수 있다:
 *  - 네이티브(apps/native)는 `bridge({...}) satisfies AppBridge`로 구현한다
 *  - 웹(apps/web)은 `linkBridge<AppBridge>()`로 가져다 쓴다
 *
 * 모든 메서드는 async다(호출이 WebView 경계를 건너 프록시된다).
 * 반환 타입은 직렬화 가능하게 유지한다(클래스 인스턴스 금지, Date는 ISO 문자열로 등).
 */

export interface SharePayload {
  /** 텍스트 / 메시지 본문. */
  message?: string;
  /** 공유할 URL(App Store 4.2: 네이티브 공유 시트). */
  url?: string;
  /** 다이얼로그 제목(선택, Android). */
  title?: string;
}

export interface NativeInfo {
  platform: "ios" | "android";
  appVersion: string;
  /** 생체인증 하드웨어가 등록·사용 가능한지. */
  biometricAvailable: boolean;
}

import type { BridgeStore } from "@webview-bridge/types";

/**
 * 브릿지 메서드 목록. @webview-bridge의 `Bridge` 제약(async 함수의 인덱스 시그니처
 * 레코드)을 구조적으로 만족시키려고 `interface`가 아니라 `type`을 쓴다. 네이티브가
 * 구현하고 웹이 호출한다.
 */
export type AppBridgeMethods = {
  /** 생체인증 잠금 해제(Face ID / 지문). 성공하면 true. */
  authenticate(reason?: string): Promise<boolean>;
  /** OS 네이티브 공유 시트를 연다. 사용자가 완료·취소하면 true. */
  share(payload: SharePayload): Promise<boolean>;
  /**
   * WebView 밖에서 URL을 연다 — OS 브라우저나 맞는 앱(카카오톡 등)으로 열린다.
   * WebView 안에서 `window.open`/`target="_blank"`는 통하지 않으므로 네이티브에 위임한다.
   * OS가 열기 요청을 받아들이면 true.
   */
  openExternal(url: string): Promise<boolean>;
  /** 푸시: 기기 푸시 토큰을 가져온다. 지금은 스텁(null 반환). */
  getPushToken(): Promise<string | null>;
  /** 푸시: 권한 요청 + 등록. 지금은 스텁(false 반환). */
  registerPush(): Promise<boolean>;
  /** 웹 UI에서 기능을 게이팅할 때 쓰는 플랫폼·기능 정보. */
  getNativeInfo(): Promise<NativeInfo>;
  /**
   * 게스트 인증: RN 메모리에 있는 access token을 반환한다 (pull 모델).
   * 없으면 네이티브가 발급을 시도하고, 발급 실패(오프라인 등) 시 null.
   * refreshToken은 절대 이 경계를 넘지 않는다.
   */
  getAccessToken(): Promise<string | null>;
  /**
   * 게스트 인증: 웹이 401을 받았을 때 호출하는 재발급 요청.
   * 네이티브가 single-flight로 rotation을 수행하고 새 access token을 반환한다.
   * refresh token까지 만료된 경우 저장된 기기 uuid로 /api/auth/guest를 다시 호출해
   * 같은 게스트 계정으로 복귀한다. 그마저 실패하면 null (호출부는 에러 UI).
   */
  refreshAccessToken(): Promise<string | null>;
};

/**
 * store로 감싼 계약 — 네이티브 `bridge()`가 반환하고 웹 `linkBridge<T>()`가 가져다 쓰는
 * 값. 양쪽이 공유하는 타입이다.
 */
export type AppBridge = BridgeStore<AppBridgeMethods>;

/**
 * 네이티브 -> 웹 이벤트(브릿지의 postMessage 채널로 발행한다).
 * 웹이 구독하고 네이티브가 발행한다(예: 푸시 알림을 탭했을 때).
 */
export type BridgeEvents = {
  pushNotificationOpened: { data: Record<string, unknown> };
};
