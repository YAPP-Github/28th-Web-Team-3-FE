import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { MissionCreationIntro } from "./mission-creation-intro";

const pushMock = vi.fn();

vi.mock("next/navigation", () => ({ useRouter: () => ({ push: pushMock }) }));

describe("MissionCreationIntro", () => {
  it("다음을 누르면 다음 단계로 이동한다", () => {
    render(
      <MissionCreationIntro
        category="식비"
        nextHref="/mission/new/result?categories=식비"
        previousHref="/mission/new"
      />,
    );

    expect(screen.getByRole("button", { name: "다음" })).toBeEnabled();
    fireEvent.click(screen.getByRole("button", { name: "다음" }));

    expect(pushMock).toHaveBeenCalledWith("/mission/new/result?categories=식비");
  });
});
