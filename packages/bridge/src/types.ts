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

/** 앱 재진입 뒤 미션 생성 상태를 복구하기 위해 네이티브에 보관하는 최소 정보. */
export interface PendingMissionGeneration {
  createdAt: number;
  expiresAt: string | null;
  jobId: string;
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
  /** OS 네이티브 공유 시트를 연다. 공유를 완료하면 true, 취소하면 false. */
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
   * 상·하단 safe-area 밴드 색을 바꾼다. 인셋의 주인이 네이티브 셸이라(`App.tsx`) 웹 CSS로는
   * 이 영역을 칠할 수 없는데, 화면마다 히어로 배경이 달라 밴드도 따라가야 한다.
   * `#rgb`·`#rrggbb`만 받는다 — 그 외 값은 무시하고 네이티브가 직전 색을 유지한다.
   */
  setSafeAreaColor(top: string, bottom: string): Promise<void>;
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
  /**
   * 게스트 인증: 회원 탈퇴 뒤 호출한다. 방금 삭제된 계정의 access/refresh token을
   * 네이티브 메모리·SecureStore에서 비워, 다음 getAccessToken이 무효 토큰으로 한 번
   * 실패하고서야 재발급으로 넘어가는 왕복을 건너뛴다. 기기 uuid는 남겨 새 게스트
   * 발급이 이어지게 한다.
   */
  clearGuestTokens(): Promise<void>;
  /** 진행 중인 미션 생성 job을 기기 저장소에 기록한다. */
  savePendingMissionGeneration(job: PendingMissionGeneration): Promise<void>;
  /** 앱 재진입 시 이어서 확인할 미션 생성 job을 읽는다. */
  getPendingMissionGeneration(): Promise<PendingMissionGeneration | null>;
  /** 결과 화면에 진입하거나 종료됐을 때 진행 중 job 기록을 지운다. */
  clearPendingMissionGeneration(): Promise<void>;
  /** 사용자가 미션 추천 생성을 한 번이라도 시작했는지 조회한다. */
  hasStartedMissionCreation(): Promise<boolean>;
  /** 기기에 기록된 첫 미션 생성일(KST, YYYY-MM-DD)을 조회한다. */
  getMissionCreationStartDate(): Promise<string | null>;
  /** 홈의 첫 생성 전 안내를 다시 보여주지 않도록 생성 시작 이력을 기록한다. */
  markMissionCreationStarted(): Promise<void>;
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
