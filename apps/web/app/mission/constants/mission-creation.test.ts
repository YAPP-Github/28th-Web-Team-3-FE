import { describe, expect, it } from "vitest";
import { buildMissionCreationFormHref, parseMissionCreationCategory } from "./mission-creation";

describe("mission creation constants", () => {
  it("선택한 카테고리의 폼 경로를 만든다", () => {
    expect(buildMissionCreationFormHref("식비")).toBe(
      "/mission/new/form?category=%EC%8B%9D%EB%B9%84",
    );
  });

  it("지원하지 않거나 제거된 카테고리는 받지 않는다", () => {
    expect(parseMissionCreationCategory("기타")).toBeUndefined();
    expect(parseMissionCreationCategory("교통")).toBeUndefined();
  });
});
