import type { PolicySummary } from "@repo/schema/policy";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { fetchPolicies } from "@/api/policy";
import { render, screen } from "@/lib/test/react";
import { FinancialTipList } from "./financial-tip-list";

vi.mock("@/api/policy", () => ({
  bookmarkPolicy: vi.fn(),
  fetchPolicies: vi.fn(),
  fetchPolicyDetail: vi.fn(),
  unbookmarkPolicy: vi.fn(),
}));

const POLICIES: PolicySummary[] = Array.from({ length: 6 }, (_, index) => ({
  id: index + 1,
  title: `정책 ${index + 1}`,
  category: index === 0 ? "금융" : null,
  largeCategory: "정부 정책",
  description: `정책 ${index + 1} 설명`,
  bookmarked: false,
}));

describe("FinancialTipList", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(fetchPolicies).mockResolvedValue(POLICIES);
  });

  it("정책 API 첫 페이지를 5개 크기로 요청하고 최대 5개만 표시한다", async () => {
    render(<FinancialTipList />);

    expect(await screen.findByText("정책 1")).toBeInTheDocument();
    expect(fetchPolicies).toHaveBeenCalledWith({ category: null, page: 0, size: 5 });
    expect(screen.getByText("정책 5")).toBeInTheDocument();
    expect(screen.queryByText("정책 6")).not.toBeInTheDocument();
  });

  it("카드에 API 분류와 설명을 표시하고 혜택 화면으로 연결한다", async () => {
    render(<FinancialTipList />);

    expect(await screen.findByText("금융")).toBeInTheDocument();
    expect(screen.getByText("정책 1 설명")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /정책 1/ })).toHaveAttribute("href", "/benefits");
  });

  it("조회 실패 시 사용자용 오류 문구를 표시한다", async () => {
    vi.mocked(fetchPolicies).mockRejectedValue(new Error("policy request failed"));

    render(<FinancialTipList />);

    expect(
      await screen.findByText("혜택을 불러오지 못했어요. 잠시 후 다시 시도해 주세요."),
    ).toBeInTheDocument();
  });
});
