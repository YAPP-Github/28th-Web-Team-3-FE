import type { SavedContent } from "@repo/schema/bookmark";
import type { PolicyDetail, PolicySummary } from "@repo/schema/policy";
import { within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { fetchSavedPolicies } from "@/api/bookmark";
import { bookmarkPolicy, fetchPolicies, fetchPolicyDetail, unbookmarkPolicy } from "@/api/policy";
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

  it("카테고리 전환을 기다리는 동안 텍스트 대신 카드 스켈레톤을 보여준다", async () => {
    vi.mocked(fetchPolicies)
      .mockResolvedValueOnce([policy(1)])
      .mockImplementationOnce(() => new Promise(() => {}));
    const { container } = render(<BenefitsExplorer />);
    await screen.findByText("혜택 1");

    fireEvent.click(screen.getByRole("link", { name: "주거" }));

    expect(screen.queryByText("불러오는 중…")).not.toBeInTheDocument();
    expect(screen.getByText("혜택 목록을 불러오는 중")).toHaveClass("sr-only");
    expect(container.querySelectorAll('[data-slot="benefit-card-skeleton"]')).toHaveLength(3);
  });

  it("저장 칩은 저장 목록 API를 쓴다", async () => {
    render(<BenefitsExplorer />);
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

  it("저장 탭도 정책 상세의 4분류 category를 태그로 쓴다", async () => {
    vi.mocked(fetchSavedPolicies).mockResolvedValue([
      {
        contentType: "POLICY",
        id: 7,
        title: "농식품 바우처",
        category: "금융·복지·문화",
        description: "설명",
      },
    ]);
    vi.mocked(fetchPolicyDetail).mockResolvedValue(
      policyDetail(7, { title: "농식품 바우처", category: "복지" }),
    );
    window.history.replaceState(null, "", "/benefits?category=saved");

    render(<BenefitsExplorer />);

    const card = (await screen.findByText("농식품 바우처")).closest("article");
    expect(card).not.toBeNull();
    expect(within(card as HTMLElement).getByText("복지")).toBeInTheDocument();
    expect(within(card as HTMLElement).queryByText("금융·복지·문화")).not.toBeInTheDocument();
  });

  it("저장한 게 없으면 안내를 띄운다", async () => {
    vi.mocked(fetchSavedPolicies).mockResolvedValue([]);
    window.history.replaceState(null, "", "/benefits?category=saved");
    render(<BenefitsExplorer />);

    expect(await screen.findByText(/저장한 혜택이 없어요/)).toBeInTheDocument();
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

  /**
   * 실패하면 재조회가 서버값을 다시 실어오긴 한다. 하지만 그건 응답이 돌아온 뒤 일이고,
   * 느리거나 끊긴 망에서는 그동안 별이 켜진 채 남아 저장된 것처럼 보인다. 여기서는 재조회를
   * 영영 멈춰 세워, 되돌리는 주체가 재조회가 아니라 실패 처리임을 못 박는다.
   */
  it("재조회를 기다리지 않고 별이 되돌아온다", async () => {
    vi.mocked(bookmarkPolicy).mockRejectedValue(new Error("network error"));
    render(<BenefitsExplorer />);
    await screen.findByText("혜택 1");

    const star = () => screen.getByRole("button", { name: "혜택 1 저장" });
    fireEvent.click(star());
    expect(star()).toHaveAttribute("aria-pressed", "true");

    // 이 시점부터 목록 재조회는 끝나지 않는다 — 이전 데이터는 그대로 그려진다.
    vi.mocked(fetchPolicies).mockImplementation(() => new Promise(() => {}));

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

  it("목록 조회에 실패하면 오류를 보여준다", async () => {
    vi.mocked(fetchPolicies).mockRejectedValue(new Error("network error"));
    render(<BenefitsExplorer />);

    expect(
      await screen.findByText("혜택을 불러오지 못했어요. 잠시 후 다시 시도해 주세요."),
    ).toBeInTheDocument();
  });
});
