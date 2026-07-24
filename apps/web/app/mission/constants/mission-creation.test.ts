import { describe, expect, it } from "vitest";
import { buildMissionCreationFormHref, parseMissionCreationCategories } from "./mission-creation";

describe("mission creation constants", () => {
  it("선택한 카테고리 순서로 폼 경로를 만든다", () => {
    const categories = parseMissionCreationCategories("식비,교통");

    expect(buildMissionCreationFormHref(categories, 0)).toBe(
      "/mission/new/form?categories=%EC%8B%9D%EB%B9%84%2C%EA%B5%90%ED%86%B5&step=0",
    );
  });

  it("지원하지 않는 카테고리는 단계 경로에서 제외한다", () => {
    expect(parseMissionCreationCategories("식비,기타,교통")).toEqual(["식비", "교통"]);
  });

  it("반복된 카테고리는 첫 번째 순서만 유지한다", () => {
    expect(parseMissionCreationCategories("식비,식비,교통,식비")).toEqual(["식비", "교통"]);
  });
});
