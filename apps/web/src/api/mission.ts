import {
  type Mission,
  type MissionCategory,
  type MissionSource,
  type MissionStatus,
  missionsResponseSchema,
} from "@repo/schema/mission";
import { http } from "@/api/client";

/**
 * 미션 API — 백엔드 OpenAPI(`/api/missions`) 연동. 공유 클라이언트를 쓰므로
 * Authorization 헤더·401 재발급은 클라이언트가 담당한다(여기선 관여하지 않는다).
 * baseUrl(`NEXT_PUBLIC_API_URL`)에 `/api`가 포함되므로 경로는 리소스명만 쓴다.
 */

export interface MissionListParams {
  category?: MissionCategory;
  status?: MissionStatus;
}

/** GET /api/missions — 페이지 없이 전체 또는 상태·카테고리로 필터링한 미션을 조회한다. */
export async function fetchMissions(params: MissionListParams = {}): Promise<Mission[]> {
  const { missions } = await http.get("missions", {
    searchParams: {
      ...(params.category ? { category: params.category } : {}),
      ...(params.status ? { status: params.status } : {}),
    },
    response: missionsResponseSchema,
  });
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
