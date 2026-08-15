import { beforeEach, describe, expect, it, vi } from "vitest";
import { getOnboardingProfile, patchOnboardingProfile } from "@/api/onboarding";
import { OnboardingFormProvider } from "@/app/onboarding/(questions)/_components/onboarding-form-provider";
import { currentUserOptions } from "@/lib/queries/auth";
import { act, createTestQueryClient, fireEvent, render, screen, waitFor } from "@/lib/test/react";
import AddressOnboardingPage from "./page";

const pushMock = vi.fn();
const replaceMock = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ prefetch: vi.fn(), push: pushMock, replace: replaceMock }),
}));
vi.mock("@/api/auth", () => ({
  getCurrentUser: vi.fn().mockResolvedValue({ userId: 1, onboardingCompleted: false }),
}));
vi.mock("@/api/onboarding", () => ({
  getOnboardingProfile: vi.fn().mockRejectedValue(new Error("test")),
  patchOnboardingProfile: vi.fn().mockResolvedValue({}),
}));

function renderAddressOnboardingPage(queryClient = createTestQueryClient()) {
  return render(
    <OnboardingFormProvider>
      <AddressOnboardingPage />
    </OnboardingFormProvider>,
    { queryClient },
  );
}

describe("AddressOnboardingPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    vi.mocked(getOnboardingProfile).mockRejectedValue(new Error("test"));
  });

  it("16개 지역 중 하나를 선택해 address만 저장하고 다음 질문으로 이동한다", async () => {
    renderAddressOnboardingPage();

    expect(screen.getAllByRole("radio")).toHaveLength(16);
    expect(screen.getByRole("button", { name: "다음" })).toBeDisabled();

    fireEvent.click(screen.getByRole("radio", { name: "경기" }));
    expect(screen.getByRole("radio", { name: "경기" })).toBeChecked();
    fireEvent.click(screen.getByRole("button", { name: "다음" }));

    await waitFor(() => {
      expect(patchOnboardingProfile).toHaveBeenCalledWith({ address: "GYEONGGI" });
      expect(pushMock).toHaveBeenCalledWith("/onboarding/month");
    });
  });

  it("서울이 아닌 저장 지역은 확인 기록 없이도 복원한다", async () => {
    vi.mocked(getOnboardingProfile).mockResolvedValue({
      status: "IN_PROGRESS",
      birthDate: "1998-03-01",
      address: "GYEONGGI",
      monthlySalaryManwon: null,
      monthlySavingManwon: null,
      netWorthManwon: null,
      goalPeriodMonths: null,
    });

    renderAddressOnboardingPage();

    await waitFor(() => expect(screen.getByRole("radio", { name: "경기" })).toBeChecked());
    expect(screen.getByRole("button", { name: "다음" })).toBeEnabled();
  });

  it("BE의 임시 서울은 직접 선택하기 전까지 미응답이며 저장 후 재진입하면 복원한다", async () => {
    vi.mocked(getOnboardingProfile).mockResolvedValue({
      status: "IN_PROGRESS",
      birthDate: "1998-03-01",
      address: "SEOUL",
      monthlySalaryManwon: null,
      monthlySavingManwon: null,
      netWorthManwon: null,
      goalPeriodMonths: null,
    });

    const firstRender = renderAddressOnboardingPage();

    await waitFor(() => expect(screen.getByRole("button", { name: "다음" })).toBeDisabled());
    expect(screen.getByRole("radio", { name: "서울" })).not.toBeChecked();

    fireEvent.click(screen.getByRole("radio", { name: "서울" }));
    expect(screen.getByRole("radio", { name: "서울" })).toBeChecked();
    expect(screen.getByRole("button", { name: "다음" })).toBeEnabled();
    fireEvent.click(screen.getByRole("button", { name: "다음" }));
    await waitFor(() => expect(patchOnboardingProfile).toHaveBeenCalledWith({ address: "SEOUL" }));
    firstRender.unmount();

    renderAddressOnboardingPage();

    await waitFor(() => expect(screen.getByRole("radio", { name: "서울" })).toBeChecked());
    expect(screen.getByRole("button", { name: "다음" })).toBeEnabled();
  });

  it("지역 목록과 겹치지 않도록 여백을 확보하고 버튼을 하단 액션 영역에 둔다", () => {
    renderAddressOnboardingPage();

    expect(
      screen.getByRole("heading", { name: "거주지역이 어디이신가요?" }).closest("section"),
    ).toHaveClass("pb-[138px]");
    expect(screen.getByRole("button", { name: "다음" }).parentElement?.parentElement).toHaveClass(
      "fixed",
      "bottom-0",
      "pt-2",
      "pb-6",
    );
  });

  it("현재 사용자 ID가 바뀌면 이전 사용자의 서울 확인 상태를 이어받지 않는다", async () => {
    vi.mocked(getOnboardingProfile).mockResolvedValue({
      status: "IN_PROGRESS",
      birthDate: "1998-03-01",
      address: "SEOUL",
      monthlySalaryManwon: null,
      monthlySavingManwon: null,
      netWorthManwon: null,
      goalPeriodMonths: null,
    });
    const queryClient = createTestQueryClient();
    renderAddressOnboardingPage(queryClient);
    await waitFor(() =>
      expect(queryClient.getQueryData(currentUserOptions().queryKey)).toEqual({
        userId: 1,
        onboardingCompleted: false,
      }),
    );
    fireEvent.click(screen.getByRole("radio", { name: "서울" }));
    expect(screen.getByRole("radio", { name: "서울" })).toBeChecked();

    act(() => {
      queryClient.setQueryData(currentUserOptions().queryKey, {
        userId: 2,
        onboardingCompleted: false,
      });
    });

    await waitFor(() => expect(screen.getByRole("radio", { name: "서울" })).not.toBeChecked());
    expect(screen.getByRole("button", { name: "다음" })).toBeDisabled();
  });

  it("이전 버튼으로 나이 질문에 돌아간다", () => {
    renderAddressOnboardingPage();

    fireEvent.click(screen.getByRole("button", { name: "이전" }));

    expect(replaceMock).toHaveBeenCalledWith("/onboarding/age");
  });
});
