import type { PolicyDetail, PolicySummary } from "@repo/schema/policy";

export function policy(id: number, overrides: Partial<PolicySummary> = {}): PolicySummary {
  return {
    id,
    title: `혜택 ${id}`,
    category: "금융",
    largeCategory: "금융",
    description: "설명",
    bookmarked: false,
    ...overrides,
  };
}

export function policyDetail(id: number, overrides: Partial<PolicyDetail> = {}): PolicyDetail {
  return {
    id,
    title: `혜택 ${id}`,
    description: "설명",
    supportContent: null,
    category: "금융",
    largeCategory: "금융",
    mediumCategory: null,
    supervisingOrg: null,
    applyUrl: null,
    applyPeriodText: null,
    applyMethod: null,
    submitDocuments: null,
    targetMinAge: null,
    targetMaxAge: null,
    earnCondition: null,
    additionalQualification: null,
    bookmarked: true,
    ...overrides,
  };
}
