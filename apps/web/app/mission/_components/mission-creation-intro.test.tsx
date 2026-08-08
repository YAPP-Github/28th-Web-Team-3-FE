import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { MissionCreationIntro } from "./mission-creation-intro";

const pushMock = vi.fn();

vi.mock("next/navigation", () => ({ useRouter: () => ({ push: pushMock }) }));

describe("MissionCreationIntro", () => {
  it("다음을 누르면 onNext를 호출한다", () => {
    const onNext = vi.fn();
    render(<MissionCreationIntro category="식비" previousHref="/mission/new" onNext={onNext} />);

    expect(screen.getByRole("button", { name: "다음" })).toBeEnabled();
    fireEvent.click(screen.getByRole("button", { name: "다음" }));

    expect(onNext).toHaveBeenCalledOnce();
  });

  it("이전을 누르면 previousHref로 이동한다", () => {
    render(<MissionCreationIntro category="식비" previousHref="/mission/new" onNext={vi.fn()} />);

    fireEvent.click(screen.getByRole("button", { name: "이전" }));

    expect(pushMock).toHaveBeenCalledWith("/mission/new");
  });
});
