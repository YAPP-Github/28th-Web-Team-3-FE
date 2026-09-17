import type { MissionGenerationJob } from "@repo/schema/mission-generation";
import { HTTPError } from "ky";

export class MissionGenerationExpiredError extends Error {
  constructor() {
    super("Mission generation result expired");
    this.name = "MissionGenerationExpiredError";
  }
}

export function missionGenerationFailureMessage(
  job: MissionGenerationJob | undefined,
  error: Error | null,
) {
  if (error instanceof MissionGenerationExpiredError) return "미션 생성 결과가 만료됐어요.";
  if (error instanceof HTTPError && [404, 410].includes(error.response.status)) {
    return "미션 생성 작업을 찾을 수 없어요.";
  }
  if (job?.status === "FAILED") return "미션 생성에 실패했어요.";
  return undefined;
}
