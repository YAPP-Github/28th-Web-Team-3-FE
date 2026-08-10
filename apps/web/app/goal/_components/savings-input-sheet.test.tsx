import { BottomSheet } from "@repo/ui";
import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@/lib/test/react";
import { SavingsInputSheet } from "./savings-input-sheet";

/** 핸들·제목이 든 끌기 영역. 시트 위쪽만 드래그를 받는다. */
function grabAreaFor(title: string) {
  const area = screen.getByText(title).parentElement;
  if (!area) throw new Error("끌기 영역을 찾지 못했다");
  return area;
}

function grabArea() {
  return grabAreaFor("현재 저축액 입력");
}

/** jsdom은 isPrimary를 false로 만든다. 실제 손가락·마우스는 항상 primary라 맞춰준다. */
const PRIMARY = { pointerId: 1, isPrimary: true, button: 0 };

function drag(target: Element, distance: number) {
  fireEvent.pointerDown(target, { ...PRIMARY, clientY: 0 });
  fireEvent.pointerMove(target, { ...PRIMARY, clientY: distance });
  fireEvent.pointerUp(target, { ...PRIMARY, clientY: distance });
}

describe("SavingsInputSheet 끌어서 닫기", () => {
  it("위쪽을 충분히 끌어내리면 닫힌다", () => {
    const onOpenChange = vi.fn();
    render(<SavingsInputSheet open onOpenChange={onOpenChange} initialManwon={0} />);

    drag(grabArea(), 120);

    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  // 조금 스친 것까지 닫으면 값을 입력하다 시트가 사라진다.
  it("조금만 끌면 닫히지 않는다", () => {
    const onOpenChange = vi.fn();
    render(<SavingsInputSheet open onOpenChange={onOpenChange} initialManwon={0} />);

    drag(grabArea(), 40);

    expect(onOpenChange).not.toHaveBeenCalled();
  });

  // 위로 끄는 건 닫기가 아니다 — 시트는 이미 화면 아래에 붙어 있다.
  it("위로 끌어도 닫히지 않는다", () => {
    const onOpenChange = vi.fn();
    render(<SavingsInputSheet open onOpenChange={onOpenChange} initialManwon={0} />);

    drag(grabArea(), -120);

    expect(onOpenChange).not.toHaveBeenCalled();
  });

  /**
   * 본문까지 끌기 영역이면 시트 안 세로 스크롤과 매번 구분해야 한다. 위쪽만 받기로 한 결정이
   * 지켜지는지 여기서 잡는다 — 본문에서 시작한 드래그는 무시돼야 한다.
   */
  it("본문에서 끌면 닫히지 않는다", () => {
    const onOpenChange = vi.fn();
    render(<SavingsInputSheet open onOpenChange={onOpenChange} initialManwon={0} />);

    drag(screen.getByRole("textbox"), 120);

    expect(onOpenChange).not.toHaveBeenCalled();
  });

  /**
   * 두 번째 손가락이 헤더에 닿으면 그 pointerdown이 기준점을 덮어써, 진행 중이던 첫 손가락의
   * 이동이 새 기준으로 계산돼 시트가 튄다. 데스크톱에서는 우클릭도 끌기를 시작시킨다.
   */
  it.each([
    ["두 번째 손가락", { pointerId: 2, isPrimary: false, button: 0 }],
    ["우클릭", { pointerId: 1, isPrimary: true, button: 2 }],
  ])("%s로는 끌기가 시작되지 않는다", (_label, pointer) => {
    const onOpenChange = vi.fn();
    render(<SavingsInputSheet open onOpenChange={onOpenChange} initialManwon={0} />);

    const area = grabArea();
    fireEvent.pointerDown(area, { ...pointer, clientY: 0 });
    fireEvent.pointerMove(area, { ...pointer, clientY: 120 });
    fireEvent.pointerUp(area, { ...pointer, clientY: 120 });

    expect(onOpenChange).not.toHaveBeenCalled();
  });

  // `>` 비교라 딱 임계값이면 닫지 않는다. 부등호가 뒤집히면 여기서 걸린다.
  it.each([
    [80, false],
    [81, true],
  ])("%ipx 끌면 닫힘=%s", (distance, closes) => {
    const onOpenChange = vi.fn();
    render(<SavingsInputSheet open onOpenChange={onOpenChange} initialManwon={0} />);

    drag(grabArea(), distance);

    expect(onOpenChange.mock.calls.length > 0).toBe(closes);
  });

  /**
   * 포인터 캡처는 끌기를 시작한 포인터만 붙잡는다. 헤더에 나중에 닿은 손가락의 이동·뗌은
   * 캡처를 우회해 그대로 들어오는데, 그걸 첫 손가락의 기준점으로 계산하면 시트가 튀고
   * 두 번째 손가락을 떼는 순간 닫힌다 — 값을 입력하던 사용자에게는 시트가 그냥 사라진다.
   */
  it("끌던 중 다른 손가락이 움직이거나 떨어져도 닫히지 않는다", () => {
    const onOpenChange = vi.fn();
    render(<SavingsInputSheet open onOpenChange={onOpenChange} initialManwon={0} />);

    const area = grabArea();
    fireEvent.pointerDown(area, { ...PRIMARY, clientY: 0 });
    fireEvent.pointerMove(area, { ...PRIMARY, clientY: 20 });

    const second = { pointerId: 2, isPrimary: false, button: 0 };
    fireEvent.pointerDown(area, { ...second, clientY: 300 });
    fireEvent.pointerMove(area, { ...second, clientY: 400 });
    fireEvent.pointerUp(area, { ...second, clientY: 400 });

    expect(onOpenChange).not.toHaveBeenCalled();

    // 첫 손가락은 그대로 살아 있어야 한다.
    fireEvent.pointerUp(area, { ...PRIMARY, clientY: 200 });
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  /**
   * transitionend는 자식에서 부모로 버블링된다. 본문 입력의 색 전환처럼 무관한 전환이
   * 끝난 걸 복귀 완료로 읽으면 복귀 애니메이션이 중간에 끊긴다.
   */
  it("본문에서 올라온 transitionend는 복귀 전환을 끄지 않는다", () => {
    render(<SavingsInputSheet open onOpenChange={() => {}} initialManwon={0} />);

    const area = grabArea();
    fireEvent.pointerDown(area, { ...PRIMARY, clientY: 0 });
    fireEvent.pointerMove(area, { ...PRIMARY, clientY: 40 });
    fireEvent.pointerUp(area, { ...PRIMARY, clientY: 40 });

    const dialog = screen.getByRole("dialog");
    expect(dialog.style.transition).toContain("transform");

    fireEvent.transitionEnd(screen.getByRole("textbox"), { propertyName: "color" });
    expect(dialog.style.transition).toContain("transform");

    // 시트 자신의 transform 전환이 끝나야 걷어낸다.
    fireEvent.transitionEnd(dialog, { propertyName: "transform" });
    expect(dialog.style.transition).toBe("none");
  });

  /**
   * 취소는 사용자가 손을 뗀 게 아니라 OS가 제스처를 가져간 것이다(제어센터 스와이프, 전화 수신).
   * 그때 누적 거리가 임계를 넘었다고 닫으면 사용자는 닫은 적 없는 시트가 사라지는 걸 본다.
   */
  it("끌기가 취소되면 닫지 않고 제자리로 돌아간다", () => {
    const onOpenChange = vi.fn();
    render(<SavingsInputSheet open onOpenChange={onOpenChange} initialManwon={0} />);

    const area = grabArea();
    fireEvent.pointerDown(area, { ...PRIMARY, clientY: 0 });
    fireEvent.pointerMove(area, { ...PRIMARY, clientY: 200 });
    fireEvent.pointerCancel(area, { ...PRIMARY, clientY: 200 });

    expect(onOpenChange).not.toHaveBeenCalled();
    expect(screen.getByRole("dialog")).toHaveStyle({ transform: "translateY(0px)" });
  });

  /**
   * 저장에 성공하면 시트는 밖에서 닫힌다. 그때 손을 떼지 않았으면 끌어둔 만큼이 상태에 남고,
   * 다음에 열 때 그만큼 내려간 자리에서 뜬다.
   */
  it("끌던 중에 밖에서 닫혀도 다시 열면 제자리다", () => {
    const sheet = (open: boolean) => (
      <SavingsInputSheet open={open} onOpenChange={() => {}} initialManwon={0} />
    );
    const { rerender } = render(sheet(true));

    const area = grabArea();
    fireEvent.pointerDown(area, { ...PRIMARY, clientY: 0 });
    fireEvent.pointerMove(area, { ...PRIMARY, clientY: 50 });
    // 손을 떼기 전에 닫힌다.
    rerender(sheet(false));
    rerender(sheet(true));

    expect(screen.getByRole("dialog")).toHaveStyle({ transform: "translateY(0px)" });
  });
});

/**
 * `open`을 주지 않고 `trigger`만 쓰는 경로. 이때는 부모가 open을 내리지 않으므로 위 effect가
 * 닫힘을 못 본다 — Root의 onOpenChange가 유일한 신호다. 스토리북이 이 방식으로 쓴다.
 * (@repo/ui에는 테스트 설정이 없어 시트를 쓰는 앱 쪽에 둔다.)
 */
describe("BottomSheet 비제어", () => {
  it("끌던 중 Escape로 닫혀도 다시 열면 제자리다", () => {
    render(
      <BottomSheet title="직접 입력" trigger={<button type="button">열기</button>}>
        <p>본문</p>
      </BottomSheet>,
    );

    fireEvent.click(screen.getByRole("button", { name: "열기" }));
    const area = grabAreaFor("직접 입력");
    fireEvent.pointerDown(area, { ...PRIMARY, clientY: 0 });
    fireEvent.pointerMove(area, { ...PRIMARY, clientY: 50 });
    fireEvent.keyDown(document, { key: "Escape" });

    fireEvent.click(screen.getByRole("button", { name: "열기" }));

    expect(screen.getByRole("dialog")).toHaveStyle({ transform: "translateY(0px)" });
  });
});
