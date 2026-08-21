import type { SavedContent } from "@repo/schema/bookmark";
import type { PolicyDetail, PolicySummary } from "@repo/schema/policy";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { fetchSavedPolicies } from "@/api/bookmark";
import { bookmarkPolicy, fetchPolicies, fetchPolicyDetail, unbookmarkPolicy } from "@/api/policy";
import { fetchAllSavingTips } from "@/api/tip";
import { POLICY_PAGE_SIZE } from "@/lib/queries/policy";
import { act, fireEvent, render, screen, waitFor } from "@/lib/test/react";
import { BenefitsExplorer } from "./benefits-explorer";

vi.mock("@/api/policy", () => ({
  bookmarkPolicy: vi.fn(),
  fetchPolicies: vi.fn(),
  fetchPolicyDetail: vi.fn(),
  unbookmarkPolicy: vi.fn(),
}));

vi.mock("@/api/bookmark", () => ({ fetchSavedPolicies: vi.fn() }));
vi.mock("@/api/tip", () => ({
  bookmarkSavingTip: vi.fn(),
  fetchAllSavingTips: vi.fn(),
  fetchSavingTips: vi.fn(),
  unbookmarkSavingTip: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useSearchParams: () => new URLSearchParams(window.location.search),
}));

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

function policyDetail(id: number, overrides: Partial<PolicyDetail> = {}): PolicyDetail {
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

const SAVED: SavedContent[] = [
  { contentType: "POLICY", id: 7, title: "저장한 혜택", category: "주거", description: "설명" },
];

/** 다음 페이지가 있으려면 첫 페이지가 꽉 차서 와야 한다(응답에 전체 개수가 없다). */
const FULL_PAGE = Array.from({ length: POLICY_PAGE_SIZE }, (_, index) => policy(index + 1));

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(fetchPolicies).mockResolvedValue([policy(1), policy(2, { bookmarked: true })]);
  vi.mocked(fetchPolicyDetail).mockImplementation((id) => Promise.resolve(policyDetail(id)));
  vi.mocked(fetchSavedPolicies).mockResolvedValue(SAVED);
  vi.mocked(bookmarkPolicy).mockResolvedValue(undefined);
  vi.mocked(unbookmarkPolicy).mockResolvedValue(undefined);
  vi.mocked(fetchAllSavingTips).mockResolvedValue([
    {
      bookmarked: false,
      category: "식비",
      description: "배달 메뉴 대신 집에서 직접 만드는 레시피 찾아보기",
      id: 1,
      sourceUrl: "https://www.youtube.com/watch?v=nZw2A76aZaw",
      subcategory: "배달음식",
      title: "집밥 레시피 활용팁",
    },
    {
      bookmarked: false,
      category: "생활",
      description: "중고구매 팁",
      id: 2,
      sourceUrl: "https://example.com/tip",
      subcategory: "의류",
      title: "당근마켓 중고활용팁",
    },
  ]);
  window.history.replaceState(null, "", "/benefits");
});

describe("BenefitsExplorer", () => {
  it("서버 prop 없이 URL의 카테고리로 첫 목록을 조회한다", async () => {
    window.history.replaceState(null, "", "/benefits?category=housing");

    render(<BenefitsExplorer />);

    await waitFor(() =>
      expect(fetchPolicies).toHaveBeenCalledWith({
        category: "주거",
        page: 0,
        size: POLICY_PAGE_SIZE,
      }),
    );
  });

  it("혜택 목록을 API에서 받아 그린다", async () => {
    render(<BenefitsExplorer />);

    expect(await screen.findByText("혜택 1")).toBeInTheDocument();
    // 전체 칩은 category 없이 첫 페이지만 요청한다.
    expect(fetchPolicies).toHaveBeenCalledWith({ category: null, page: 0, size: POLICY_PAGE_SIZE });
  });

  it("카테고리 칩은 서버 4분류로 다시 조회한다", async () => {
    render(<BenefitsExplorer />);
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

  /**
   * 카테고리가 바뀌면 캐시 키가 통째로 바뀐다. 직전 결과를 유지하지 않으면 그 사이
   * 목록이 스켈레톤으로 갈아엎였다가 새로 채워져 깜빡인다.
   */
  it("카테고리를 전환해도 새 목록이 오기 전까지 이전 목록을 유지한다", async () => {
    vi.mocked(fetchPolicies)
      .mockResolvedValueOnce([policy(1)])
      .mockImplementationOnce(() => new Promise(() => {}));
    const { container } = render(<BenefitsExplorer />);
    await screen.findByText("혜택 1");

    fireEvent.click(screen.getByRole("link", { name: "주거" }));

    expect(screen.getByText("혜택 1")).toBeInTheDocument();
    expect(container.querySelectorAll('[data-slot="benefit-card-skeleton"]')).toHaveLength(0);
  });

  it("별을 누르면 저장하고, 저장된 항목은 취소한다", async () => {
    render(<BenefitsExplorer />);
    await screen.findByText("혜택 1");

    fireEvent.click(screen.getByRole("button", { name: "혜택 1 저장" }));
    await waitFor(() => expect(bookmarkPolicy).toHaveBeenCalledWith(1));

    fireEvent.click(screen.getByRole("button", { name: "혜택 2 저장" }));
    await waitFor(() => expect(unbookmarkPolicy).toHaveBeenCalledWith(2));
  });

  /**
   * 왕복을 기다렸다 뒤집으면 그동안 별이 눌리지 않은 것처럼 보여 사용자가 한 번 더 누른다.
   * 요청이 나가기 전에 이미 바뀌어 있어야 한다.
   */
  it("별을 누르면 요청 전에 화면이 먼저 바뀐다", async () => {
    render(<BenefitsExplorer />);
    await screen.findByText("혜택 1");

    fireEvent.click(screen.getByRole("button", { name: "혜택 1 저장" }));

    expect(screen.getByRole("button", { name: "혜택 1 저장" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(bookmarkPolicy).not.toHaveBeenCalled();
  });

  // 연타를 그대로 보내면 응답 순서가 뒤집혀 화면과 서버가 어긋난다.
  it("연타해도 요청은 마지막 상태로 한 번만 나간다", async () => {
    render(<BenefitsExplorer />);
    await screen.findByText("혜택 1");

    const star = () => screen.getByRole("button", { name: "혜택 1 저장" });
    fireEvent.click(star()); // 저장
    fireEvent.click(star()); // 취소
    fireEvent.click(star()); // 저장

    await waitFor(() => expect(bookmarkPolicy).toHaveBeenCalledTimes(1));
    expect(bookmarkPolicy).toHaveBeenCalledWith(1);
    expect(unbookmarkPolicy).not.toHaveBeenCalled();
  });

  // 짝수 번 눌러 제자리로 돌아왔으면 서버는 이미 그 상태다.
  it("눌렀다 되돌리면 아무것도 보내지 않는다", async () => {
    render(<BenefitsExplorer />);
    await screen.findByText("혜택 1");

    const star = () => screen.getByRole("button", { name: "혜택 1 저장" });
    fireEvent.click(star());
    fireEvent.click(star());

    await waitFor(() => expect(star()).toHaveAttribute("aria-pressed", "false"));
    await new Promise((resolve) => setTimeout(resolve, 600));
    expect(bookmarkPolicy).not.toHaveBeenCalled();
    expect(unbookmarkPolicy).not.toHaveBeenCalled();
  });

  /** 실패하면 서버 재조회와 무관하게 낙관적 값을 즉시 되돌려야 한다. */
  it("재조회를 기다리지 않고 별이 되돌아온다", async () => {
    vi.mocked(bookmarkPolicy).mockRejectedValue(new Error("network error"));
    render(<BenefitsExplorer />);
    await screen.findByText("혜택 1");

    const star = () => screen.getByRole("button", { name: "혜택 1 저장" });
    fireEvent.click(star());
    expect(star()).toHaveAttribute("aria-pressed", "true");

    await waitFor(() => expect(star()).toHaveAttribute("aria-pressed", "false"));
  });

  // 실패하면 되돌려만 놓고 멈춘다. 다시 누르면 그때는 나가야 한다.
  it("실패한 뒤 다시 누르면 보낸다", async () => {
    vi.mocked(bookmarkPolicy).mockRejectedValueOnce(new Error("network error"));
    render(<BenefitsExplorer />);
    await screen.findByText("혜택 1");

    const star = () => screen.getByRole("button", { name: "혜택 1 저장" });
    fireEvent.click(star());
    await waitFor(() => expect(star()).toHaveAttribute("aria-pressed", "false"));

    fireEvent.click(star());

    await waitFor(() => expect(bookmarkPolicy).toHaveBeenCalledTimes(2));
  });

  /**
   * 요청이 나가 있는 동안 또 누르면, 그 항목을 큐에서 지운 뒤에는 아직 확정되지 않은
   * 낙관적 값을 서버값으로 삼게 된다. 그러면 보내야 할 것을 "이미 그 상태"로 보고 건너뛴다.
   */
  it("요청이 나가 있는 동안 눌린 것도 이어서 보낸다", async () => {
    let finishBookmark: (() => void) | undefined;
    vi.mocked(bookmarkPolicy).mockImplementation(
      () =>
        new Promise<void>((resolve) => {
          finishBookmark = resolve;
        }),
    );
    render(<BenefitsExplorer />);
    await screen.findByText("혜택 1");

    const star = () => screen.getByRole("button", { name: "혜택 1 저장" });
    fireEvent.click(star()); // 저장 요청이 나간다
    await waitFor(() => expect(bookmarkPolicy).toHaveBeenCalledTimes(1));

    fireEvent.click(star()); // 응답 전에 취소로 바꾼다
    await waitFor(() => expect(star()).toHaveAttribute("aria-pressed", "false"));
    finishBookmark?.();

    await waitFor(() => expect(unbookmarkPolicy).toHaveBeenCalledWith(1));
  });

  it("저장에 실패하면 오류를 보여준다", async () => {
    vi.mocked(bookmarkPolicy).mockRejectedValue(new Error("network error"));
    render(<BenefitsExplorer />);
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
    render(<BenefitsExplorer />);
    await screen.findByText("혜택 1");

    intersect?.();

    expect(await screen.findByText("혜택 99")).toBeInTheDocument();
    expect(fetchPolicies).toHaveBeenLastCalledWith({
      category: null,
      page: 1,
      size: POLICY_PAGE_SIZE,
    });
  });

  it("다음 페이지를 기다리는 동안 기존 목록 아래에 카드 스켈레톤 하나를 보여준다", async () => {
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
      .mockImplementationOnce(() => new Promise(() => {}));
    const { container } = render(<BenefitsExplorer />);
    await screen.findByText("혜택 1");

    intersect?.();

    await waitFor(() => expect(fetchPolicies).toHaveBeenCalledTimes(2));
    expect(screen.getByText("혜택 1")).toBeInTheDocument();
    expect(container.querySelectorAll('[data-slot="benefit-card-skeleton"]')).toHaveLength(1);
  });

  it("다음 페이지 조회 실패 시 기존 목록을 유지하고 다시 시도한다", async () => {
    let intersect: (() => void) | undefined;
    let finishRetry: ((policies: PolicySummary[]) => void) | undefined;
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
      .mockRejectedValueOnce(new Error("network error"))
      .mockImplementationOnce(
        () =>
          new Promise((resolve) => {
            finishRetry = resolve;
          }),
      );
    render(<BenefitsExplorer />);
    await screen.findByText("혜택 1");

    intersect?.();

    expect(
      await screen.findByText("다음 혜택을 불러오지 못했어요. 다시 시도해 주세요."),
    ).toBeInTheDocument();
    expect(screen.getByText("혜택 1")).toBeInTheDocument();

    const retryButton = screen.getByRole("button", { name: "다시 시도" });
    fireEvent.click(retryButton);

    await waitFor(() => expect(fetchPolicies).toHaveBeenCalledTimes(3));
    expect(retryButton).toHaveAttribute("aria-busy", "true");
    expect(screen.getByText("다음 혜택을 다시 불러오는 중이에요.")).toHaveAttribute(
      "role",
      "status",
    );
    expect(document.querySelectorAll('[data-slot="benefit-card-skeleton"]')).toHaveLength(0);
    await act(async () => {
      finishRetry?.([policy(99)]);
    });

    expect(await screen.findByText("혜택 99")).toBeInTheDocument();
    await waitFor(() => expect(screen.getByRole("region", { name: "정책 목록" })).toHaveFocus());
  });

  it("첫 목록 조회에 실패하면 다시 시도할 수 있다", async () => {
    let finishRetry: ((policies: PolicySummary[]) => void) | undefined;
    vi.mocked(fetchPolicies)
      .mockRejectedValueOnce(new Error("network error"))
      .mockImplementationOnce(
        () =>
          new Promise((resolve) => {
            finishRetry = resolve;
          }),
      );
    render(<BenefitsExplorer />);

    expect(
      await screen.findByText("혜택을 불러오지 못했어요. 잠시 후 다시 시도해 주세요."),
    ).toBeInTheDocument();

    const retryButton = screen.getByRole("button", { name: "다시 시도" });
    fireEvent.click(retryButton);

    await waitFor(() => expect(fetchPolicies).toHaveBeenCalledTimes(2));
    expect(retryButton).toHaveAttribute("aria-busy", "true");
    expect(screen.getByText("혜택을 다시 불러오는 중이에요.")).toHaveAttribute("role", "status");
    await act(async () => {
      finishRetry?.([policy(3)]);
    });

    expect(await screen.findByText("혜택 3")).toBeInTheDocument();
    await waitFor(() => expect(screen.getByRole("region", { name: "정책 목록" })).toHaveFocus());
  });

  it("필터 링크에 읽기 쉬운 색과 키보드 포커스 표시가 있다", async () => {
    render(<BenefitsExplorer />);
    await screen.findByText("혜택 1");

    const housingFilter = screen.getByRole("link", { name: "주거" });
    expect(housingFilter).toHaveClass("text-gray-300", "focus-visible:ring-2");
  });

  it("절약 팁 탭은 API 목록을 보이고 정책 목록을 다시 조회하지 않는다", async () => {
    render(<BenefitsExplorer />);
    await screen.findByText("혜택 1");
    vi.mocked(fetchPolicies).mockClear();

    fireEvent.click(screen.getByRole("tab", { name: "절약 팁" }));

    expect(await screen.findByText("집밥 레시피 활용팁")).toBeInTheDocument();
    expect(
      screen.getByText("배달 메뉴 대신 집에서 직접 만드는 레시피 찾아보기"),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /집밥 레시피 활용팁/ })).toHaveAttribute(
      "href",
      "https://www.youtube.com/watch?v=nZw2A76aZaw",
    );
    expect(screen.queryByText("혜택 1")).not.toBeInTheDocument();
    expect(fetchPolicies).not.toHaveBeenCalled();
    expect(fetchAllSavingTips).toHaveBeenCalledWith(null, 100);
  });

  it("절약 팁은 미션과 같은 대분류로 API 목록을 좁힌다", async () => {
    render(<BenefitsExplorer />);
    await screen.findByText("혜택 1");

    fireEvent.click(screen.getByRole("tab", { name: "절약 팁" }));
    fireEvent.click(screen.getByRole("button", { name: "생활" }));

    await waitFor(() => expect(fetchAllSavingTips).toHaveBeenCalledWith("생활", 100));
    expect(screen.getByRole("button", { name: "생활" })).toHaveAttribute("aria-pressed", "true");
  });

  it("탭을 되돌리면 정책 목록이 다시 보인다", async () => {
    render(<BenefitsExplorer />);
    await screen.findByText("혜택 1");

    fireEvent.click(screen.getByRole("tab", { name: "절약 팁" }));
    fireEvent.click(screen.getByRole("tab", { name: "정책 혜택" }));

    expect(await screen.findByText("혜택 1")).toBeInTheDocument();
  });
});
