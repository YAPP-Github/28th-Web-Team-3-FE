import { type Mission, type MissionSource, missionsResponseSchema } from "@repo/schema/mission";
import { http } from "@/api/client";

/**
 * 미션 API — 백엔드 OpenAPI(`/api/missions`) 연동. 공유 클라이언트를 쓰므로
 * Authorization 헤더·401 재발급은 클라이언트가 담당한다(여기선 관여하지 않는다).
 * baseUrl(`NEXT_PUBLIC_API_URL`)에 `/api`가 포함되므로 경로는 리소스명만 쓴다.
 */

/** GET /api/missions — 내 미션 전체 조회(active/completed 구분은 호출부에서 status로 나눈다). */
export async function fetchMissions(): Promise<readonly Mission[]> {
  const { missions } = await http.get("missions", { response: missionsResponseSchema });
  return missions;
}

/** PATCH /api/missions/{source}/{missionId}/complete — 미션 완료 처리. */
export function completeMission(source: MissionSource, missionId: string): Promise<void> {
  return http.patch(`missions/${source}/${missionId}/complete`);
}

/** DELETE /api/missions/recommended/{missionId} — 추천 미션 삭제. */
export function deleteRecommendedMission(missionId: string): Promise<void> {
  return http.delete(`missions/recommended/${missionId}`);
}
