import type { MissionCatalogResponse } from "@repo/schema/mission";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { fetchMissionCatalog, requestGenerationJob } from "@/api/mission-generation";
import { fireEvent, render, screen, waitFor } from "@/lib/test/react";
import { MissionCreationFormClient } from "./mission-creation-form-client";

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
      ],
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

describe("MissionCreationFormClient", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(fetchMissionCatalog).mockResolvedValue(CATALOG);
    vi.mocked(requestGenerationJob).mockResolvedValue(JOB);
  });

  it("인트로의 다음 버튼으로 신규 3단계 질문에 진입한다", async () => {
    render(
      <MissionCreationFormClient category="식비" categoryCode="MEAL" previousHref="/mission/new" />,
    );

    fireEvent.click(screen.getByRole("button", { name: "다음" }));

    expect(
      await screen.findByRole("heading", {
        name: "식비 중 줄이고 싶은 항목이 무엇인가요?",
      }),
    ).toHaveFocus();
  });

  it("항목·주간 횟수·만원 금액을 생성 요청 계약으로 변환한다", async () => {
    render(
      <MissionCreationFormClient category="식비" categoryCode="MEAL" previousHref="/mission/new" />,
    );

    fireEvent.click(screen.getByRole("button", { name: "다음" }));
    fireEvent.click(await screen.findByRole("button", { name: "배달음식" }));
    fireEvent.click(screen.getByRole("button", { name: "다음" }));

    expect(
      screen.getByRole("heading", { name: "한 주에 배달음식을 몇 번 이용하나요?" }),
    ).toHaveFocus();
    const frequencyInput = screen.getByLabelText("주간 소비 횟수");
    expect(frequencyInput).toHaveAccessibleDescription("1회부터 10회까지 입력할 수 있어요.");
    fireEvent.change(frequencyInput, { target: { value: "3" } });
    fireEvent.click(screen.getByRole("button", { name: "다음" }));

    const amountInput = screen.getByLabelText("주간 소비 금액(만원)");
    expect(amountInput).toHaveAccessibleDescription("1만원부터 200만원까지 입력할 수 있어요.");
    fireEvent.change(amountInput, { target: { value: "5" } });
    fireEvent.click(screen.getByRole("button", { name: "다음" }));

    await waitFor(() =>
      expect(requestGenerationJob).toHaveBeenCalledWith({
        category: "MEAL",
        item: "DELIVERY_FOOD",
        baselineFrequency: 3,
        baselineAmountWon: 50_000,
      }),
    );
    expect(pushMock).toHaveBeenCalledWith("/mission/new/generating?jobId=job-1");
  });

  it("생성 요청 실패를 보조기기에 알린다", async () => {
    vi.mocked(requestGenerationJob).mockRejectedValue(new Error("network error"));
    render(
      <MissionCreationFormClient category="식비" categoryCode="MEAL" previousHref="/mission/new" />,
    );

    fireEvent.click(screen.getByRole("button", { name: "다음" }));
    fireEvent.click(await screen.findByRole("button", { name: "배달음식" }));
    fireEvent.click(screen.getByRole("button", { name: "다음" }));
    fireEvent.change(screen.getByLabelText("주간 소비 횟수"), { target: { value: "3" } });
    fireEvent.click(screen.getByRole("button", { name: "다음" }));
    fireEvent.change(screen.getByLabelText("주간 소비 금액(만원)"), {
      target: { value: "5" },
    });
    fireEvent.click(screen.getByRole("button", { name: "다음" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("미션 생성을 시작하지 못했어요.");
  });
});
