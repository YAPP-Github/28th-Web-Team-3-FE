import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@/lib/test/react";
import { MissionAddMenu } from "./mission-add-menu";

describe("MissionAddMenu", () => {
  it("플로팅 버튼 영역 밖의 미션 카드를 가로채지 않는다", () => {
    render(<MissionAddMenu isOpen={false} onToggle={vi.fn()} />);

    const addButton = screen.getByRole("button", { name: "미션 추가 메뉴 열기" });
    expect(addButton.parentElement).toHaveClass("pointer-events-none");
    expect(addButton).toHaveClass("pointer-events-auto");
  });

  it("열린 메뉴의 선택지는 클릭을 받는다", () => {
    render(<MissionAddMenu isOpen onToggle={vi.fn()} />);

    expect(document.getElementById("mission-add-menu")).toHaveClass("pointer-events-auto");
  });
});
