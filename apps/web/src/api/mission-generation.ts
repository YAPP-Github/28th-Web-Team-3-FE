import { type MissionCatalogResponse, missionCatalogResponseSchema } from "@repo/schema/mission";
import {
  type MissionConfirmRequest,
  type MissionConfirmResponse,
  type MissionDraftsResponse,
  type MissionGenerationCreateRequest,
  type MissionGenerationJob,
  missionConfirmRequestSchema,
  missionConfirmResponseSchema,
  missionDraftsResponseSchema,
  missionGenerationCreateRequestSchema,
  missionGenerationJobSchema,
} from "@repo/schema/mission-generation";
import { http } from "@/api/client";
import { recordMissionGenerationPollMetric } from "@/app/mission/new/utils/mission-generation-polling-metrics";

/**
 * 미션 초안 생성(비동기 job) API — 백엔드 OpenAPI(`/api/missions/generation-jobs`) 연동.
 */

/** GET /api/missions/catalog — 생성 가능한 카테고리·소비 항목 조회. */
export function fetchMissionCatalog(): Promise<MissionCatalogResponse> {
  return http.get("missions/catalog", { response: missionCatalogResponseSchema });
}

/** POST /api/missions/generation-jobs — 입력값 기반 생성 job 요청. */
export function requestGenerationJob(
  body: MissionGenerationCreateRequest,
): Promise<MissionGenerationJob> {
  return http.post("missions/generation-jobs", {
    body,
    request: missionGenerationCreateRequestSchema,
    response: missionGenerationJobSchema,
  });
}

/** GET /api/missions/generation-jobs/{jobId} — job 상태 polling. */
export async function fetchGenerationJobStatus(jobId: string): Promise<MissionGenerationJob> {
  const startedAt = performance.now();
  try {
    return await http.get(`missions/generation-jobs/${jobId}`, {
      response: missionGenerationJobSchema,
    });
  } finally {
    recordMissionGenerationPollMetric({
      durationMs: performance.now() - startedAt,
      source: "page",
    });
  }
}

/** GET /api/missions/generation-jobs/{jobId}/drafts — 완료된 job의 카테고리별 초안 조회. */
export function fetchGenerationDrafts(jobId: string): Promise<MissionDraftsResponse> {
  return http.get(`missions/generation-jobs/${jobId}/drafts`, {
    response: missionDraftsResponseSchema,
  });
}

/** POST /api/missions/generation-jobs/{jobId}/confirm — 선택한 초안을 ACTIVE 미션으로 확정. */
export function confirmGenerationJob(
  jobId: string,
  body: MissionConfirmRequest,
): Promise<MissionConfirmResponse> {
  return http.post(`missions/generation-jobs/${jobId}/confirm`, {
    body,
    request: missionConfirmRequestSchema,
    response: missionConfirmResponseSchema,
  });
}
