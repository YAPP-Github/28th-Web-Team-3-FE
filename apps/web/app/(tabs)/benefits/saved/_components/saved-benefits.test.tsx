import type { SavedContent } from "@repo/schema/bookmark";
import type { PolicyDetail } from "@repo/schema/policy";
import { within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { fetchSavedPolicies } from "@/api/bookmark";
import { bookmarkPolicy, fetchPolicyDetail, unbookmarkPolicy } from "@/api/policy";
import { savedPoliciesOptions } from "@/lib/queries/bookmark";
import { policiesOptions } from "@/lib/queries/policy";
import { act, createTestQueryClient, fireEvent, render, screen, waitFor } from "@/lib/test/react";
import { SavedBenefits } from "./saved-benefits";

vi.mock("@/api/policy", () => ({
  bookmarkPolicy: vi.fn(),
  fetchPolicies: vi.fn(),
  fetchPolicyDetail: vi.fn(),
  unbookmarkPolicy: vi.fn(),
}));

vi.mock("@/api/bookmark", () => ({ fetchSavedPolicies: vi.fn() }));

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

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(fetchPolicyDetail).mockImplementation((id) => Promise.resolve(policyDetail(id)));
  vi.mocked(fetchSavedPolicies).mockResolvedValue(SAVED);
  vi.mocked(bookmarkPolicy).mockResolvedValue(undefined);
  vi.mocked(unbookmarkPolicy).mockResolvedValue(undefined);
});

describe("SavedBenefits", () => {
  it("세그먼트 탭과 저장 카드 사이에 20px 간격을 둔다", async () => {
    render(<SavedBenefits />);

    await screen.findByText("저장한 혜택");

    expect(screen.getByRole("region", { name: "저장한 혜택" })).toHaveClass("mt-5");
  });

  it("저장 목록 API로 목록을 그린다", async () => {
    render(<SavedBenefits />);

    expect(await screen.findByText("저장한 혜택")).toBeInTheDocument();
    expect(fetchSavedPolicies).toHaveBeenCalled();
    // 저장 목록의 항목은 전부 저장된 상태로 보여야 한다.
    expect(screen.getByRole("button", { name: "저장한 혜택 저장" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
  });

  it("정책 상세의 4분류 category를 태그로 쓴다", async () => {
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

    render(<SavedBenefits />);

    const card = (await screen.findByText("농식품 바우처")).closest("article");
    expect(card).not.toBeNull();
    expect(within(card as HTMLElement).getByText("복지")).toBeInTheDocument();
    expect(within(card as HTMLElement).queryByText("금융·복지·문화")).not.toBeInTheDocument();
  });

  /**
   * 저장 30개면 상세 요청도 30번이었다. 혜택 목록이나 홈을 이미 봤다면 같은 분류가
   * 캐시에 있으므로 거기서 꺼내 쓰고, 없는 것만 조회한다.
   */
  it("목록 캐시에 분류가 있으면 상세를 조회하지 않는다", async () => {
    vi.mocked(fetchSavedPolicies).mockResolvedValue([
      {
        contentType: "POLICY",
        id: 7,
        title: "캐시에 있는 혜택",
        category: "원본",
        description: "설명",
      },
      {
        contentType: "POLICY",
        id: 8,
        title: "캐시에 없는 혜택",
        category: "원본",
        description: "설명",
      },
    ]);
    vi.mocked(fetchPolicyDetail).mockResolvedValue(policyDetail(8, { category: "교육" }));
    const queryClient = createTestQueryClient();
    // 테스트 클라이언트는 gcTime이 0이라 관찰자 없는 캐시가 즉시 사라진다.
    queryClient.setQueryDefaults(policiesOptions(null).queryKey, {
      gcTime: Number.POSITIVE_INFINITY,
    });
    queryClient.setQueryData(policiesOptions(null).queryKey, {
      pages: [
        [
          {
            id: 7,
            title: "캐시에 있는 혜택",
            category: "복지",
            largeCategory: "복지",
            description: "설명",
            bookmarked: true,
          },
        ],
      ],
      pageParams: [0],
    });

    render(<SavedBenefits />, { queryClient });

    const cached = (await screen.findByText("캐시에 있는 혜택")).closest("article");
    expect(within(cached as HTMLElement).getByText("복지")).toBeInTheDocument();

    // 캐시에 없는 8번만 상세를 받는다.
    await waitFor(() => expect(fetchPolicyDetail).toHaveBeenCalledWith(8));
    expect(fetchPolicyDetail).toHaveBeenCalledTimes(1);
  });

  // 캐시에 분류가 빈 채로 있으면 태그도 비어야 한다 — 상세를 부르지 않기로 한 항목이다.
  it("캐시의 분류가 비어 있으면 상세를 부르지 않고 태그도 비운다", async () => {
    vi.mocked(fetchSavedPolicies).mockResolvedValue([
      {
        contentType: "POLICY",
        id: 7,
        title: "분류 없는 혜택",
        category: "원본",
        description: "설명",
      },
    ]);
    const queryClient = createTestQueryClient();
    queryClient.setQueryDefaults(policiesOptions(null).queryKey, {
      gcTime: Number.POSITIVE_INFINITY,
    });
    queryClient.setQueryData(policiesOptions(null).queryKey, {
      pages: [
        [
          {
            id: 7,
            title: "분류 없는 혜택",
            category: null,
            largeCategory: null,
            description: "설명",
            bookmarked: true,
          },
        ],
      ],
      pageParams: [0],
    });

    render(<SavedBenefits />, { queryClient });

    const card = (await screen.findByText("분류 없는 혜택")).closest("article");
    expect(within(card as HTMLElement).queryByText("원본")).not.toBeInTheDocument();
    expect(fetchPolicyDetail).not.toHaveBeenCalled();
  });

  it("정책 상세가 늦어도 저장 목록부터 보여준다", async () => {
    let finishDetail: ((detail: PolicyDetail) => void) | undefined;
    vi.mocked(fetchPolicyDetail).mockImplementation(
      () =>
        new Promise((resolve) => {
          finishDetail = resolve;
        }),
    );

    render(<SavedBenefits />);

    const card = (await screen.findByText("저장한 혜택")).closest("article");
    expect(card).not.toBeNull();
    expect(within(card as HTMLElement).queryByText("복지")).not.toBeInTheDocument();

    await act(async () => {
      finishDetail?.(policyDetail(7, { category: "복지" }));
    });

    await waitFor(() => expect(within(card as HTMLElement).getByText("복지")).toBeInTheDocument());
  });

  it("저장한 게 없으면 안내를 띄운다", async () => {
    vi.mocked(fetchSavedPolicies).mockResolvedValue([]);

    render(<SavedBenefits />);

    expect(await screen.findByText(/저장한 혜택이 없어요/)).toBeInTheDocument();
  });

  it("저장 취소 전에 확인하고 아니요를 누르면 그대로 둔다", async () => {
    render(<SavedBenefits />);

    fireEvent.click(await screen.findByRole("button", { name: "저장한 혜택 저장" }));

    expect(screen.getByRole("dialog", { name: "저장을 취소할까요?" })).toBeInTheDocument();
    expect(screen.getByText("저장한 혜택")).toBeInTheDocument();
    expect(unbookmarkPolicy).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole("button", { name: "아니요" }));

    expect(screen.queryByRole("dialog", { name: "저장을 취소할까요?" })).not.toBeInTheDocument();
    expect(screen.getByText("저장한 혜택")).toBeInTheDocument();
    expect(unbookmarkPolicy).not.toHaveBeenCalled();
  });

  it("저장 취소 실패 시 닫힌 모달을 다시 열지 않고 카드를 되돌린다", async () => {
    vi.mocked(unbookmarkPolicy).mockRejectedValue(new Error("network error"));
    render(<SavedBenefits />);

    fireEvent.click(await screen.findByRole("button", { name: "저장한 혜택 저장" }));
    fireEvent.click(screen.getByRole("button", { name: "취소" }));

    expect(screen.queryByRole("dialog", { name: "저장을 취소할까요?" })).not.toBeInTheDocument();

    expect(
      await screen.findByText("저장 상태를 바꾸지 못했어요. 잠시 후 다시 시도해 주세요."),
    ).toBeInTheDocument();
    expect(screen.queryByRole("dialog", { name: "저장을 취소할까요?" })).not.toBeInTheDocument();
    expect(screen.getByText("저장한 혜택")).toBeInTheDocument();
  });

  it("해제한 카드를 성공 직후 다시 보여주지 않는다", async () => {
    let finishUnbookmark: (() => void) | undefined;
    vi.mocked(unbookmarkPolicy).mockImplementation(
      () =>
        new Promise<void>((resolve) => {
          finishUnbookmark = resolve;
        }),
    );
    const queryClient = createTestQueryClient();
    render(<SavedBenefits />, { queryClient });

    const star = await screen.findByRole("button", { name: "저장한 혜택 저장" });
    fireEvent.click(star);
    fireEvent.click(screen.getByRole("button", { name: "취소" }));
    expect(screen.queryByText("저장한 혜택")).not.toBeInTheDocument();
    expect(screen.queryByRole("dialog", { name: "저장을 취소할까요?" })).not.toBeInTheDocument();

    await waitFor(() => expect(unbookmarkPolicy).toHaveBeenCalledWith(7));
    await act(async () => {
      finishUnbookmark?.();
    });
    await waitFor(() => expect(queryClient.isMutating()).toBe(0));
    await waitFor(() => expect(queryClient.isFetching()).toBe(0));

    expect(screen.queryByText("저장한 혜택")).not.toBeInTheDocument();
    expect(screen.queryByRole("dialog", { name: "저장을 취소할까요?" })).not.toBeInTheDocument();
  });

  it("해제 전에 시작한 이전 목록 조회가 늦게 끝나도 카드를 다시 보여주지 않는다", async () => {
    let finishStaleFetch: (() => void) | undefined;
    vi.mocked(fetchSavedPolicies)
      .mockResolvedValueOnce(SAVED)
      .mockImplementationOnce(
        () =>
          new Promise((resolve) => {
            finishStaleFetch = () => resolve(SAVED);
          }),
      );
    const queryClient = createTestQueryClient();
    render(<SavedBenefits />, { queryClient });

    const star = await screen.findByRole("button", { name: "저장한 혜택 저장" });
    void queryClient.refetchQueries({ queryKey: savedPoliciesOptions().queryKey });
    await waitFor(() => expect(fetchSavedPolicies).toHaveBeenCalledTimes(2));

    fireEvent.click(star);
    fireEvent.click(screen.getByRole("button", { name: "취소" }));
    expect(screen.queryByText("저장한 혜택")).not.toBeInTheDocument();

    await act(async () => {
      finishStaleFetch?.();
    });
    await waitFor(() => expect(queryClient.isFetching()).toBe(0));

    expect(screen.queryByText("저장한 혜택")).not.toBeInTheDocument();
  });

  it("해제 뒤 시작한 이전 목록 조회도 성공 상태를 덮어쓰지 않는다", async () => {
    let finishUnbookmark: (() => void) | undefined;
    let finishStaleFetch: (() => void) | undefined;
    vi.mocked(unbookmarkPolicy).mockImplementation(
      () =>
        new Promise<void>((resolve) => {
          finishUnbookmark = resolve;
        }),
    );
    vi.mocked(fetchSavedPolicies)
      .mockResolvedValueOnce(SAVED)
      .mockImplementationOnce(
        () =>
          new Promise((resolve) => {
            finishStaleFetch = () => resolve(SAVED);
          }),
      );
    const queryClient = createTestQueryClient();
    render(<SavedBenefits />, { queryClient });

    const star = await screen.findByRole("button", { name: "저장한 혜택 저장" });
    fireEvent.click(star);
    fireEvent.click(screen.getByRole("button", { name: "취소" }));
    void queryClient.refetchQueries({ queryKey: savedPoliciesOptions().queryKey });
    await waitFor(() => expect(fetchSavedPolicies).toHaveBeenCalledTimes(2));

    await act(async () => {
      finishStaleFetch?.();
    });
    await waitFor(() => expect(queryClient.isFetching()).toBe(0));
    await waitFor(() => expect(unbookmarkPolicy).toHaveBeenCalledWith(7));
    await act(async () => {
      finishUnbookmark?.();
    });
    await waitFor(() => expect(queryClient.isMutating()).toBe(0));

    expect(screen.queryByText("저장한 혜택")).not.toBeInTheDocument();
  });

  it("절약 팁 탭은 기기에 저장한 팁이 없을 때 안내를 보여준다", async () => {
    render(<SavedBenefits />);
    await screen.findByText("저장한 혜택");

    fireEvent.click(screen.getByRole("tab", { name: "절약 팁" }));

    expect(await screen.findByText(/저장한 절약 팁이 없어요/)).toBeInTheDocument();
    expect(screen.queryByText("저장한 혜택")).not.toBeInTheDocument();
  });
});
