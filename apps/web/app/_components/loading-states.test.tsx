import { Button, ButtonGroup } from "@repo/ui";
import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@/lib/test/react";
import { GoalSectionSkeleton } from "./goal-section-skeleton";
import { MissionListSkeleton } from "./mission-list-skeleton";
import { RouteLoading } from "./route-loading";

/**
 * 처리 중을 문구로 알리면(“저장 중…”) 버튼 폭이 흔들리고, 스크린리더는 이름이 통째로 바뀐
 * 것으로 읽는다. 처리 중은 상태지 이름이 아니다 — 이름은 그대로 두고 상태만 알린다.
 */
describe("Button pending", () => {
  it("처리 중에도 버튼 이름이 그대로다", () => {
    render(<Button pending>다음</Button>);

    expect(screen.getByRole("button", { name: "다음" })).toBeInTheDocument();
  });

  it("처리 중이라고 표시한다", () => {
    render(<Button pending>다음</Button>);

    expect(screen.getByRole("button", { name: "다음" })).toHaveAttribute("aria-busy", "true");
  });

  /**
   * `disabled`를 걸면 브라우저가 초점을 body로 옮겨, 방금 누른 버튼의 aria-busy가
   * 스크린리더에 전달될 길이 사라진다. variant의 disabled 회색조까지 걸려서 "처리 중"이
   * 아니라 "지금 못 누름"으로 읽히기도 한다.
   */
  it("처리 중에도 초점을 잃지 않는다", () => {
    render(<Button pending>다음</Button>);

    const button = screen.getByRole("button", { name: "다음" });
    expect(button).not.toBeDisabled();
    expect(button).toHaveAttribute("aria-disabled", "true");

    button.focus();
    expect(button).toHaveFocus();
  });

  // 응답을 기다리는 동안 또 누르면 같은 요청이 두 번 나간다.
  it("처리 중에는 다시 눌러도 실행되지 않는다", () => {
    const onClick = vi.fn();
    render(
      <Button pending onClick={onClick}>
        다음
      </Button>,
    );

    fireEvent.click(screen.getByRole("button", { name: "다음" }));

    expect(onClick).not.toHaveBeenCalled();
  });

  it("처리 중이 아니면 aria-busy를 붙이지 않는다", () => {
    render(<Button>다음</Button>);

    expect(screen.getByRole("button", { name: "다음" })).not.toHaveAttribute("aria-busy");
  });
});

describe("ButtonGroup nextPending", () => {
  it("다음 문구를 유지한 채 처리 중으로 표시한다", () => {
    render(<ButtonGroup nextLabel="이 목표로 시작" nextPending onNext={() => {}} />);

    const next = screen.getByRole("button", { name: "이 목표로 시작" });
    expect(next).toHaveAttribute("aria-busy", "true");
  });

  /** 저장 중에 뒤로 가면 어느 쪽이 이긴 상태인지 화면만 봐서는 알 수 없다. */
  it("처리 중에는 이전 버튼도 막는다", () => {
    const onPrev = vi.fn();
    render(<ButtonGroup nextPending onNext={() => {}} onPrev={onPrev} />);

    fireEvent.click(screen.getByRole("button", { name: "이전" }));

    expect(onPrev).not.toHaveBeenCalled();
  });
});

/**
 * 뼈대는 볼거리지 읽을거리가 아니다. 회색 블록 하나하나를 읽어주면 소음만 늘어난다 —
 * 대기 중이라는 사실만 감싸는 영역이 알린다.
 */
describe("로딩 자리표시자", () => {
  /**
   * 라이브 리전은 내용을 읽는다 — `aria-label`은 읽지 않는다. 그리고 리전에 `aria-busy`를
   * 붙이면 "false가 될 때까지 알리지 마라"가 되는데, 이 리전은 false가 되는 일 없이
   * 그대로 사라진다. 둘 다 틀리면 대기 상태가 아예 전달되지 않는다.
   */
  it.each([
    ["목표", <GoalSectionSkeleton key="goal" label="목표를 불러오는 중" />, "목표를 불러오는 중"],
    [
      "미션",
      <MissionListSkeleton key="mission" label="미션을 불러오는 중" />,
      "미션을 불러오는 중",
    ],
    ["라우트", <RouteLoading key="route" />, "불러오는 중"],
  ])("%s 자리표시자는 읽을 문장을 리전 안에 둔다", (_label, element, name) => {
    render(element);

    const status = screen.getByRole("status");
    expect(status).not.toHaveAttribute("aria-busy");
    expect(status).toHaveTextContent(name);
  });

  /** 홈은 목표·미션 자리가 동시에 뜬다. 각자 알리면 두 번 읽힌다. */
  it("라벨이 없으면 라이브 리전을 만들지 않는다", () => {
    render(<MissionListSkeleton />);

    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });

  it("회색 블록 자체는 읽히지 않는다", () => {
    const { container } = render(<MissionListSkeleton count={2} />);

    const blocks = container.querySelectorAll(".animate-pulse");
    expect(blocks.length).toBeGreaterThan(0);
    for (const block of blocks) {
      expect(block).toHaveAttribute("aria-hidden", "true");
    }
  });

  it("개수를 준 만큼 카드 자리를 깐다", () => {
    const { container, rerender } = render(<MissionListSkeleton count={2} />);
    const countCards = () => container.querySelectorAll(".rounded-2xl").length;

    expect(countCards()).toBe(2);

    rerender(<MissionListSkeleton count={4} />);
    expect(countCards()).toBe(4);
  });
});
