export const BENEFIT_CATEGORY_VALUES = ["all", "savings", "housing", "living", "tax"] as const;
export type BenefitCategory = (typeof BENEFIT_CATEGORY_VALUES)[number];
export type BenefitItemCategory = Exclude<BenefitCategory, "all">;

export type BenefitStatus = "available" | "scheduled" | "closed" | "check-required";

export interface Benefit {
  id: string;
  category: BenefitItemCategory;
  title: string;
  status: BenefitStatus;
  summary: string;
  condition: string;
  estimatedSaving: string;
  deadline: string;
  officialLinks: readonly {
    label: string;
    url: string;
  }[];
}
