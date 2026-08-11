import type { SavedContent } from "@repo/schema/bookmark";
import type { PolicySummary } from "@repo/schema/policy";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { fetchSavedPolicies } from "@/api/bookmark";
import { bookmarkPolicy, fetchPolicies, unbookmarkPolicy } from "@/api/policy";
import { POLICY_PAGE_SIZE } from "@/lib/queries/policy";
import { fireEvent, render, screen, waitFor } from "@/lib/test/react";
import { BenefitsExplorer } from "./benefits-explorer";

vi.mock("@/api/policy", () => ({
  bookmarkPolicy: vi.fn(),
  fetchPolicies: vi.fn(),
  fetchPolicyDetail: vi.fn(),
  unbookmarkPolicy: vi.fn(),
}));

vi.mock("@/api/bookmark", () => ({ fetchSavedPolicies: vi.fn() }));

function policy(id: number, overrides: Partial<PolicySummary> = {}): PolicySummary {
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

const SAVED: SavedContent[] = [
  { contentType: "POLICY", id: 7, title: "저장한 혜택", category: "주거", description: "설명" },
];

/** 다음 페이지가 있으려면 첫 페이지가 꽉 차서 와야 한다(응답에 전체 개수가 없다). */
const FULL_PAGE = Array.from({ length: POLICY_PAGE_SIZE }, (_, index) => policy(index + 1));

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(fetchPolicies).mockResolvedValue([policy(1), policy(2, { bookmarked: true })]);
  vi.mocked(fetchSavedPolicies).mockResolvedValue(SAVED);
  vi.mocked(bookmarkPolicy).mockResolvedValue(undefined);
  vi.mocked(unbookmarkPolicy).mockResolvedValue(undefined);
  window.history.replaceState(null, "", "/benefits");
});

describe("BenefitsExplorer", () => {
  it("혜택 목록을 API에서 받아 그린다", async () => {
    render(<BenefitsExplorer initialFilter="all" />);

    expect(await screen.findByText("혜택 1")).toBeInTheDocument();
    // 전체 칩은 category 없이 첫 페이지만 요청한다.
    expect(fetchPolicies).toHaveBeenCalledWith({ category: null, page: 0, size: POLICY_PAGE_SIZE });
  });

  it("카테고리 칩은 서버 4분류로 다시 조회한다", async () => {
    render(<BenefitsExplorer initialFilter="all" />);
    await screen.findByText("혜택 1");

    fireEvent.click(screen.getByRole("link", { name: "주거" }));

    await waitFor(() =>
      expect(fetchPolicies).toHaveBeenCalledWith({
        category: "주거",
        page: 0,
        size: POLICY_PAGE_SIZE,
      }),
    );
  });

  it("저장 칩은 저장 목록 API를 쓴다", async () => {
    render(<BenefitsExplorer initialFilter="all" />);
    await screen.findByText("혜택 1");

    fireEvent.click(screen.getByRole("link", { name: "저장" }));

    expect(await screen.findByText("저장한 혜택")).toBeInTheDocument();
    expect(fetchSavedPolicies).toHaveBeenCalled();
    // 저장 목록의 항목은 전부 저장된 상태로 보여야 한다.
    expect(screen.getByRole("button", { name: "저장한 혜택 저장" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
  });

  it("저장한 게 없으면 안내를 띄운다", async () => {
    vi.mocked(fetchSavedPolicies).mockResolvedValue([]);
    render(<BenefitsExplorer initialFilter="saved" />);

    expect(await screen.findByText(/저장한 혜택이 없어요/)).toBeInTheDocument();
  });

  it("별을 누르면 저장하고, 저장된 항목은 취소한다", async () => {
    render(<BenefitsExplorer initialFilter="all" />);
    await screen.findByText("혜택 1");

    fireEvent.click(screen.getByRole("button", { name: "혜택 1 저장" }));
    await waitFor(() => expect(bookmarkPolicy).toHaveBeenCalledWith(1));

    fireEvent.click(screen.getByRole("button", { name: "혜택 2 저장" }));
    await waitFor(() => expect(unbookmarkPolicy).toHaveBeenCalledWith(2));
  });

  it("저장에 실패하면 오류를 보여준다", async () => {
    vi.mocked(bookmarkPolicy).mockRejectedValue(new Error("network error"));
    render(<BenefitsExplorer initialFilter="all" />);
    await screen.findByText("혜택 1");

    fireEvent.click(screen.getByRole("button", { name: "혜택 1 저장" }));

    expect(
      await screen.findByText("저장 상태를 바꾸지 못했어요. 잠시 후 다시 시도해 주세요."),
    ).toBeInTheDocument();
  });

  it("목록 끝이 보이면 다음 페이지를 이어붙인다", async () => {
    let intersect: (() => void) | undefined;
    vi.stubGlobal(
      "IntersectionObserver",
      class {
        constructor(private readonly callback: IntersectionObserverCallback) {}
        observe(target: Element) {
          intersect = () =>
            this.callback(
              [{ isIntersecting: true, target } as IntersectionObserverEntry],
              this as unknown as IntersectionObserver,
            );
        }
        unobserve() {}
        disconnect() {}
      },
    );
    vi.mocked(fetchPolicies)
      .mockResolvedValueOnce(FULL_PAGE)
      .mockResolvedValueOnce([policy(99)]);
    render(<BenefitsExplorer initialFilter="all" />);
    await screen.findByText("혜택 1");

    intersect?.();

    expect(await screen.findByText("혜택 99")).toBeInTheDocument();
    expect(fetchPolicies).toHaveBeenLastCalledWith({
      category: null,
      page: 1,
      size: POLICY_PAGE_SIZE,
    });
  });

  it("목록 조회에 실패하면 오류를 보여준다", async () => {
    vi.mocked(fetchPolicies).mockRejectedValue(new Error("network error"));
    render(<BenefitsExplorer initialFilter="all" />);

    expect(
      await screen.findByText("혜택을 불러오지 못했어요. 잠시 후 다시 시도해 주세요."),
    ).toBeInTheDocument();
  });
});
