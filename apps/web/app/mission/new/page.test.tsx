import type { MissionCatalogResponse } from "@repo/schema/mission";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { fetchMissionCatalog, requestGenerationJob } from "@/api/mission-generation";
import { fireEvent, render, screen, waitFor } from "@/lib/test/react";
import NewMissionPage from "./page";

const pushMock = vi.fn();

vi.mock("next/navigation", () => ({ useRouter: () => ({ push: pushMock }) }));

vi.mock("@/api/mission-generation", () => ({
  confirmGenerationJob: vi.fn(),
  fetchGenerationDrafts: vi.fn(),
  fetchGenerationJobStatus: vi.fn(),
  fetchMissionCatalog: vi.fn(),
  requestGenerationJob: vi.fn(),
}));

const CATALOG: MissionCatalogResponse = {
  categories: [
    {
      category: "MEAL",
      items: [
        { code: "DELIVERY_FOOD", label: "배달음식" },
        { code: "DINING_OUT", label: "외식" },
        { code: "SNACK", label: "간식" },
      ],
    },
    {
      category: "LIVING",
      items: [{ code: "CLOTHING", label: "의류" }],
    },
    {
      category: "HOBBY",
      items: [{ code: "GAME", label: "게임" }],
    },
  ],
};

const JOB = {
  jobId: "job-1",
  status: "PENDING" as const,
  failureCode: null,
  generationSource: null,
  draftsAvailable: false,
  expiresAt: null,
  confirmed: false,
  pollingIntervalMillis: 2000,
};

async function chooseMealAndDelivery() {
  fireEvent.click(screen.getByRole("button", { name: "식비" }));
  expect(screen.getByRole("status", { name: "다음 질문을 준비하고 있어요" })).toBeVisible();
  fireEvent.click(await screen.findByRole("button", { name: "배달음식" }, { timeout: 1_500 }));
}

describe("NewMissionPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(fetchMissionCatalog).mockResolvedValue(CATALOG);
    vi.mocked(requestGenerationJob).mockResolvedValue(JOB);
  });

  it("답변 사이에 타이핑 상태를 보여주고 완성된 요청을 전송한다", async () => {
    render(<NewMissionPage />);

    expect(screen.getByRole("heading", { name: "미션 추가" })).toBeVisible();
    expect(screen.getByRole("button", { name: "미션 추천 받기" })).toBeDisabled();
    await chooseMealAndDelivery();

    fireEvent.click(await screen.findByRole("button", { name: "3회" }, { timeout: 1_500 }));
    const amountInput = await screen.findByLabelText("평소 소비 금액", {}, { timeout: 1_500 });
    fireEvent.change(amountInput, { target: { value: "50000" } });
    expect(amountInput).toHaveValue("50,000");
    await waitFor(() => expect(screen.getByRole("button", { name: "답변 보내기" })).toBeEnabled());
    fireEvent.click(screen.getByRole("button", { name: "답변 보내기" }));

    const submitButton = await screen.findByRole("button", { name: "미션 추천 받기" });
    await waitFor(() => expect(submitButton).toBeEnabled());
    fireEvent.click(submitButton);

    await waitFor(() =>
      expect(requestGenerationJob).toHaveBeenCalledWith({
        category: "MEAL",
        item: "DELIVERY_FOOD",
        baselineFrequency: 3,
        baselineAmountWon: 50_000,
      }),
    );
    expect(pushMock).toHaveBeenCalledWith("/mission/new/loading?jobId=job-1");
  });

  it("이전 답변을 누르면 연필을 표시하고 해당 질문부터 다시 시작한다", async () => {
    render(<NewMissionPage />);
    await chooseMealAndDelivery();

    expect(
      screen.queryByRole("button", { name: "식비 답변 다시 선택하기" }),
    ).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "식비 답변 수정 버튼 표시" }));
    fireEvent.click(screen.getByRole("button", { name: "식비 답변 다시 선택하기" }));

    expect(screen.getByRole("button", { name: "식비" })).toBeEnabled();
    expect(screen.queryByRole("button", { name: "배달음식" })).not.toBeInTheDocument();
  });

  it("횟수 답변을 다시 시작해 직접 입력하면 이전 값을 지우고 채팅 입력창으로 답한다", async () => {
    render(<NewMissionPage />);
    await chooseMealAndDelivery();

    fireEvent.click(await screen.findByRole("button", { name: "3회" }, { timeout: 1_500 }));
    await screen.findByLabelText("평소 소비 금액", {}, { timeout: 1_500 });
    fireEvent.click(screen.getByRole("button", { name: "3회 답변 다시 선택하기" }));
    fireEvent.click(await screen.findByRole("button", { name: "직접입력" }, { timeout: 1_500 }));
    const frequencyInput = screen.getByLabelText("평소 이용 횟수");
    expect(frequencyInput).toHaveValue("");
    fireEvent.change(frequencyInput, { target: { value: "4" } });
    await waitFor(() => expect(screen.getByRole("button", { name: "답변 보내기" })).toBeEnabled());
    fireEvent.click(screen.getByRole("button", { name: "답변 보내기" }));

    expect(
      await screen.findByRole(
        "heading",
        { name: "평소 배달음식으로 얼마 쓰세요?" },
        { timeout: 1_500 },
      ),
    ).toBeVisible();
    expect(screen.getByRole("button", { name: "4회 답변 수정 버튼 표시" })).toBeVisible();
  });

  it("생성 요청 실패를 보조기기에 알린다", async () => {
    vi.mocked(requestGenerationJob).mockRejectedValue(new Error("network error"));
    render(<NewMissionPage />);
    await chooseMealAndDelivery();

    fireEvent.click(await screen.findByRole("button", { name: "1회" }, { timeout: 1_500 }));
    const amountInput = await screen.findByLabelText("평소 소비 금액", {}, { timeout: 1_500 });
    fireEvent.change(amountInput, { target: { value: "10000" } });
    await waitFor(() => expect(screen.getByRole("button", { name: "답변 보내기" })).toBeEnabled());
    fireEvent.click(screen.getByRole("button", { name: "답변 보내기" }));
    fireEvent.click(await screen.findByRole("button", { name: "미션 추천 받기" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("미션 생성을 시작하지 못했어요.");
  });

  it("직접 입력한 횟수가 범위를 벗어나면 오류를 입력창에 연결한다", async () => {
    render(<NewMissionPage />);
    await chooseMealAndDelivery();

    fireEvent.click(await screen.findByRole("button", { name: "직접입력" }, { timeout: 1_500 }));
    const frequencyInput = screen.getByLabelText("평소 이용 횟수");
    fireEvent.change(frequencyInput, { target: { value: "11" } });

    const error = await screen.findByText("1회 이상 10회 이하로 입력해주세요.");
    expect(error).toHaveAttribute("role", "alert");
    expect(frequencyInput).toHaveAttribute("aria-describedby", error.id);
    expect(screen.getByRole("button", { name: "답변 보내기" })).toBeDisabled();
  });
});
