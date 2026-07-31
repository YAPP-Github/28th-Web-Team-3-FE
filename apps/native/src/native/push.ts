/**
 * 푸시 알림 — 스텁.
 *
 * 브릿지 인터페이스(`getPushToken` / `registerPush`)는 @repo/bridge에 미리 정의해
 * 계약을 처음부터 고정해뒀다. 구현은 일부러 미룬다 — expo-notifications를 연결하려면
 * EAS 프로젝트 id, APNs/FCM 자격증명, 서버 쪽 토큰 등록 엔드포인트가 필요하다.
 *
 * 나중에 구현할 때:
 *   import * as Notifications from "expo-notifications";
 *   const { status } = await Notifications.requestPermissionsAsync();
 *   const token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
 *   // 토큰은 서버로 직접 POST한다(네이티브 -> 서버). 웹에는 절대 노출하지 않는다.
 */

export async function getToken(): Promise<string | null> {
  return null;
}

export async function register(): Promise<boolean> {
  return false;
}
