import type { PolicyDetail } from "@repo/schema/policy";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { fetchPolicyDetail } from "@/api/policy";
import type { BenefitItem } from "@/app/(tabs)/benefits/types";
import { openExternalLink } from "@/lib/open-external";
import { createTestQueryClient, fireEvent, render, screen } from "@/lib/test/react";
import { BenefitCard } from "./benefit-card";

vi.mock("@/api/policy", () => ({ fetchPolicyDetail: vi.fn() }));
vi.mock("@/lib/open-external", () => ({ openExternalLink: vi.fn() }));

const BENEFIT: BenefitItem = {
  id: 1,
  title: "청년 주택드림 청약통장",
  categoryLabel: "주거",
  description: "설명",
  saved: false,
};

function detail(overrides: Partial<PolicyDetail> = {}): PolicyDetail {
  return {
    id: 1,
    title: BENEFIT.title,
    description: "설명",
    supportContent: null,
    category: "주거",
    largeCategory: "주거",
    mediumCategory: null,
    supervisingOrg: null,
    applyUrl: "https://example.com/apply",
    applyPeriodText: null,
    applyMethod: null,
    submitDocuments: null,
    targetMinAge: null,
    targetMaxAge: null,
    earnCondition: null,
    additionalQualification: null,
    bookmarked: false,
    ...overrides,
  };
}

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(fetchPolicyDetail).mockResolvedValue(detail());
});

describe("BenefitCard", () => {
  // 신청 링크는 목록 응답에 없다 — 눌렀을 때 상세를 받아 열어야 한다.
  it("제목을 누르면 상세의 신청 링크를 연다", async () => {
    render(<BenefitCard benefit={BENEFIT} onToggleSave={vi.fn()} />);

    fireEvent.click(screen.getByRole("button", { name: BENEFIT.title }));

    await vi.waitFor(() =>
      expect(openExternalLink).toHaveBeenCalledWith("https://example.com/apply"),
    );
    expect(fetchPolicyDetail).toHaveBeenCalledWith(1);
  });

  /**
   * 상세를 캐시로 받는다 — 저장 화면은 같은 상세를 이미 받아 뒀고, 같은 카드를 다시 눌러도
   * 왕복이 늘지 않아야 한다.
   *
   * 테스트 클라이언트는 캐시를 남기지 않으므로(gcTime 0·staleTime 0) 실제 앱과 같은 값으로
   * 맞춘다(`packages/api/src/query-client.tsx`의 staleTime 60초).
   */
  it("같은 카드를 다시 눌러도 상세는 한 번만 받는다", async () => {
    const queryClient = createTestQueryClient();
    queryClient.setQueryDefaults([], {
      gcTime: Number.POSITIVE_INFINITY,
      staleTime: 60 * 1000,
    });
    render(<BenefitCard benefit={BENEFIT} onToggleSave={vi.fn()} />, { queryClient });

    fireEvent.click(screen.getByRole("button", { name: BENEFIT.title }));
    await vi.waitFor(() => expect(openExternalLink).toHaveBeenCalledTimes(1));

    fireEvent.click(screen.getByRole("button", { name: BENEFIT.title }));

    await vi.waitFor(() => expect(openExternalLink).toHaveBeenCalledTimes(2));
    expect(fetchPolicyDetail).toHaveBeenCalledTimes(1);
  });

  // 재시도로 풀리지 않는 실패라 "잠시 후 다시"라고 하면 안 된다.
  it("신청 링크가 없으면 그 사실을 알린다", async () => {
    vi.mocked(fetchPolicyDetail).mockResolvedValue(detail({ applyUrl: null }));
    render(<BenefitCard benefit={BENEFIT} onToggleSave={vi.fn()} />);

    fireEvent.click(screen.getByRole("button", { name: BENEFIT.title }));

    expect(await screen.findByText("신청 페이지가 등록되지 않은 혜택이에요.")).toBeInTheDocument();
    expect(openExternalLink).not.toHaveBeenCalled();
  });

  it("상세 조회에 실패하면 오류를 보여준다", async () => {
    vi.mocked(fetchPolicyDetail).mockRejectedValue(new Error("network error"));
    render(<BenefitCard benefit={BENEFIT} onToggleSave={vi.fn()} />);

    fireEvent.click(screen.getByRole("button", { name: BENEFIT.title }));

    expect(
      await screen.findByText("혜택 정보를 불러오지 못했어요. 잠시 후 다시 시도해 주세요."),
    ).toBeInTheDocument();
  });

  it("분류가 없는 혜택은 태그를 그리지 않는다", () => {
    render(<BenefitCard benefit={{ ...BENEFIT, categoryLabel: null }} onToggleSave={vi.fn()} />);

    expect(screen.queryByText("주거")).not.toBeInTheDocument();
  });

  it("키보드 포커스와 누르기 쉬운 저장 영역을 제공한다", () => {
    render(<BenefitCard benefit={BENEFIT} onToggleSave={vi.fn()} />);

    expect(screen.getByRole("button", { name: `${BENEFIT.title} 저장` })).toHaveClass(
      "size-11",
      "focus-visible:ring-2",
    );
    expect(screen.getByRole("button", { name: BENEFIT.title })).toHaveClass("focus-visible:ring-2");
  });

  it("긴 분류·제목·설명을 카드 안에서 잘라 보여준다", () => {
    const longBenefit = {
      ...BENEFIT,
      title: "아주 긴 혜택 제목".repeat(20),
      categoryLabel: "아주 긴 혜택 분류".repeat(10),
      description: "아주 긴 혜택 설명".repeat(30),
    };
    render(<BenefitCard benefit={longBenefit} onToggleSave={vi.fn()} />);

    expect(screen.getByText(longBenefit.categoryLabel)).toHaveClass("truncate");
    expect(screen.getByRole("button", { name: longBenefit.title })).toHaveClass("line-clamp-2");
    // 설명은 접힌 상태가 기본이라 한 줄만 보인다 — 펼치면 전체가 나온다.
    expect(screen.getByText(longBenefit.description)).toHaveClass("line-clamp-1");
  });

  it("설명을 접어 두고 화살표로 펼친다", () => {
    render(<BenefitCard benefit={BENEFIT} onToggleSave={vi.fn()} />);

    const toggle = screen.getByRole("button", { name: `${BENEFIT.title} 설명 펼치기` });
    expect(toggle).toHaveAttribute("aria-expanded", "false");
    expect(screen.getByText("설명")).toHaveClass("line-clamp-1");

    fireEvent.click(toggle);

    expect(screen.getByRole("button", { name: `${BENEFIT.title} 설명 접기` })).toHaveAttribute(
      "aria-expanded",
      "true",
    );
    expect(screen.getByText("설명")).not.toHaveClass("line-clamp-1");
  });

  /** 카드 전체가 신청 페이지로 나가는 덮개라, 펼침 버튼이 덮개 위에 없으면 클릭이 먹힌다. */
  it("펼침 버튼은 카드 링크 덮개 위에 있다", () => {
    render(<BenefitCard benefit={BENEFIT} onToggleSave={vi.fn()} />);

    expect(screen.getByRole("button", { name: `${BENEFIT.title} 설명 펼치기` })).toHaveClass(
      "z-10",
    );
  });
});
