import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { MissionCreationResult } from "./mission-creation-result";

const pushMock = vi.fn();

vi.mock("next/navigation", () => ({ useRouter: () => ({ push: pushMock }) }));

describe("MissionCreationResult", () => {
  it("미션을 고르면 다음 버튼을 활성화하고 미션 홈으로 이동한다", () => {
    render(<MissionCreationResult categories={["식비"]} previousHref="/mission/new/form" />);

    expect(screen.getByRole("button", { name: "다음" })).toBeDisabled();

    fireEvent.click(screen.getByRole("button", { name: "이번 주 배달음식 2회 이하로 주문" }));
    expect(screen.getByRole("button", { name: "다음" })).toBeEnabled();

    fireEvent.click(screen.getByRole("button", { name: "다음" }));
    expect(pushMock).toHaveBeenCalledWith("/mission?addedMissionIds=suggestion-food-delivery");
  });
});
