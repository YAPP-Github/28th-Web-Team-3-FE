import { describe, expect, it } from "vitest";
import {
  MISSION_CREATION_CATEGORY_CODES,
  MISSION_RECOMMENDATION_CATEGORIES,
} from "./mission-creation";

describe("mission creation constants", () => {
  it("채팅에 표시할 카테고리 순서와 API 코드를 유지한다", () => {
    expect(MISSION_RECOMMENDATION_CATEGORIES.map(({ name }) => name)).toEqual([
      "식비",
      "생활",
      "취미",
    ]);
    expect(MISSION_CREATION_CATEGORY_CODES).toEqual({
      식비: "MEAL",
      생활: "LIVING",
      취미: "HOBBY",
    });
  });
});
