import type { PolicyCategory } from "@repo/schema/policy";
import type { BenefitFilter } from "./types";

/**
 * 필터 칩. `category`는 서버 `/api/policies`의 `category` 쿼리로 그대로 나가는 값이고,
 * 목록을 좁히지 않는 "전체"만 null이다. 저장 목록은 칩이 아니라 `/benefits/saved`다.
 */
export const BENEFIT_FILTERS: readonly {
  value: BenefitFilter;
  label: string;
  category: PolicyCategory | null;
}[] = [
  { value: "all", label: "전체", category: null },
  { value: "finance", label: "금융", category: "금융" },
  { value: "housing", label: "주거", category: "주거" },
  { value: "welfare", label: "복지", category: "복지" },
  { value: "education", label: "교육", category: "교육" },
];
