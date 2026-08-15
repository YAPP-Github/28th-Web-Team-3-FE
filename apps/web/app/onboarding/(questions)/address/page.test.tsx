import { beforeEach, describe, expect, it, vi } from "vitest";
import { getOnboardingProfile, patchOnboardingProfile } from "@/api/onboarding";
import { OnboardingFormProvider } from "@/app/onboarding/(questions)/_components/onboarding-form-provider";
import { fireEvent, render, screen, waitFor } from "@/lib/test/react";
import AddressOnboardingPage from "./page";

const pushMock = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ prefetch: vi.fn(), push: pushMock }),
}));
vi.mock("@/api/onboarding", () => ({
  getOnboardingProfile: vi.fn().mockRejectedValue(new Error("test")),
  patchOnboardingProfile: vi.fn().mockResolvedValue({}),
}));

function renderAddressOnboardingPage() {
  return render(
    <OnboardingFormProvider>
      <AddressOnboardingPage />
    </OnboardingFormProvider>,
  );
}

describe("AddressOnboardingPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
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

  it("저장된 지역을 복원하면 다시 선택하지 않아도 진행할 수 있다", async () => {
    vi.mocked(getOnboardingProfile).mockResolvedValue({
      status: "IN_PROGRESS",
      birthDate: "1998-03-01",
      address: "SEOUL",
      monthlySalaryManwon: null,
      monthlySavingManwon: null,
      netWorthManwon: null,
      goalPeriodMonths: null,
    });

    renderAddressOnboardingPage();

    await waitFor(() => expect(screen.getByRole("radio", { name: "서울" })).toBeChecked());
    expect(screen.getByRole("button", { name: "다음" })).toBeEnabled();
  });

  it("지역 목록과 겹치지 않도록 여백을 확보하고 버튼을 하단 액션 영역에 둔다", () => {
    renderAddressOnboardingPage();

    expect(
      screen.getByRole("heading", { name: "거주지역이 어디이신가요?" }).closest("section"),
    ).toHaveClass("pb-[138px]");
    expect(screen.getByRole("button", { name: "다음" }).parentElement).toHaveClass(
      "fixed",
      "bottom-0",
      "pt-2",
      "pb-6",
    );
  });
});
