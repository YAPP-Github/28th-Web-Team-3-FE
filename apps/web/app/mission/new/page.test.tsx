import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import NewMissionPage from "./page";

const pushMock = vi.fn();

vi.mock("next/navigation", () => ({ useRouter: () => ({ push: pushMock }) }));

describe("NewMissionPage", () => {
  it("카테고리를 여러 개 선택하면 다음 버튼을 활성화한다", () => {
    render(<NewMissionPage />);

    fireEvent.click(screen.getByRole("button", { name: "식비" }));
    fireEvent.click(screen.getByRole("button", { name: "취미" }));

    expect(screen.getByRole("button", { name: "다음" })).toBeEnabled();
    expect(screen.getByRole("button", { name: "식비" })).toHaveAttribute("data-state", "on");
    expect(screen.getByRole("button", { name: "취미" })).toHaveAttribute("data-state", "on");

    fireEvent.click(screen.getByRole("button", { name: "다음" }));
    expect(pushMock).toHaveBeenCalledWith(
      "/mission/new/form?categories=%EC%8B%9D%EB%B9%84%2C%EC%B7%A8%EB%AF%B8&step=0",
    );
  });
});
