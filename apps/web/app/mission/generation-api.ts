import { parseJson } from "@repo/api/json";
import {
  type MissionConfirmRequest,
  type MissionConfirmResponse,
  type MissionDraftsResponse,
  type MissionGenerationJob,
  missionConfirmRequestSchema,
  missionConfirmResponseSchema,
  missionDraftsResponseSchema,
  missionGenerationJobSchema,
} from "@repo/schema/mission-generation";
import { api } from "@/lib/api";

/**
 * 미션 초안 생성(비동기 job) API — 백엔드 OpenAPI(`/api/missions/generation-jobs`) 연동.
 */

/** POST /api/missions/generation-jobs — 생성 job 요청(진행 중이면 같은 job 반환). */
export function requestGenerationJob(): Promise<MissionGenerationJob> {
  return parseJson(api.post("missions/generation-jobs"), missionGenerationJobSchema);
}

/** GET /api/missions/generation-jobs/{jobId} — job 상태 polling. */
export function fetchGenerationJobStatus(jobId: string): Promise<MissionGenerationJob> {
  return parseJson(api.get(`missions/generation-jobs/${jobId}`), missionGenerationJobSchema);
}

/** GET /api/missions/generation-jobs/{jobId}/drafts — 완료된 job의 카테고리별 초안 조회. */
export function fetchGenerationDrafts(jobId: string): Promise<MissionDraftsResponse> {
  return parseJson(
    api.get(`missions/generation-jobs/${jobId}/drafts`),
    missionDraftsResponseSchema,
  );
}

/** POST /api/missions/generation-jobs/{jobId}/confirm — 선택한 초안을 ACTIVE 미션으로 확정. */
export function confirmGenerationJob(
  jobId: string,
  body: MissionConfirmRequest,
): Promise<MissionConfirmResponse> {
  return parseJson(
    api.post(`missions/generation-jobs/${jobId}/confirm`, {
      json: missionConfirmRequestSchema.parse(body),
    }),
    missionConfirmResponseSchema,
  );
}
