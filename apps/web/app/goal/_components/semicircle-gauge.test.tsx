import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import {
  ARC_END_X,
  ARC_PATH,
  ARC_START_X,
  SemicircleGauge,
  VIEWBOX_WIDTH,
} from "./semicircle-gauge";

describe("SemicircleGauge", () => {
  it("percent가 0이면 진행 path를 그리지 않는다(둥근 캡 점 방지)", () => {
    const { container } = render(
      <SemicircleGauge maxLabel="5,000만원" minLabel="0" percent={0} savedLabel="0만원" />,
    );
    // 트랙 path 하나만 남는다.
    expect(container.querySelectorAll("path")).toHaveLength(1);
  });

  it("percent가 0보다 크면 진행 path까지 그린다", () => {
    const { container } = render(
      <SemicircleGauge maxLabel="5,000만원" minLabel="0" percent={39} savedLabel="1,950만원" />,
    );
    expect(container.querySelectorAll("path")).toHaveLength(2);
  });

  /**
   * 채움은 CSS 키프레임(`gauge-fill`)이 길이 0에서 목표 비율까지 늘려 그린다. JS로 값을
   * 바꾸면 첫 페인트가 무조건 길이 0이라, 하이드레이션 전까지 둥근 캡이 점으로 남는다.
   * 그래서 attribute에는 끝난 뒤 남을 값을 두고, 키프레임 목표만 `--gauge-dash`로 넘긴다.
   */
  it("채움 길이를 키프레임으로 늘리고 끝값은 attribute에 둔다", () => {
    const { container } = render(
      <SemicircleGauge maxLabel="5,000만원" minLabel="0" percent={39} savedLabel="1,950만원" />,
    );

    const fill = container.querySelectorAll("path")[1];
    expect(fill).toHaveAttribute("stroke-dasharray", "39 100");
    expect(fill).toHaveClass("animate-gauge-fill", "motion-reduce:animate-none");
    expect(fill?.getAttribute("style")).toContain("--gauge-dash: 39");
  });

  /**
   * CSS 키프레임은 마운트 시 한 번만 재생된다 — 같은 DOM 노드가 유지된 채 percent만
   * 바뀌면(저축액 수정 등) 애니메이션이 다시 돌지 않고 값이 바로 튄다. key를 percent에
   * 걸어 값이 바뀔 때마다 새 노드를 만들어 채움 모션이 다시 재생되게 한다.
   */
  it("percent가 바뀌면 채움 path를 새로 마운트해 모션을 다시 재생한다", () => {
    const { container, rerender } = render(
      <SemicircleGauge maxLabel="5,000만원" minLabel="0" percent={39} savedLabel="1,950만원" />,
    );
    const before = container.querySelectorAll("path")[1];

    rerender(
      <SemicircleGauge maxLabel="5,000만원" minLabel="0" percent={82} savedLabel="4,100만원" />,
    );
    const after = container.querySelectorAll("path")[1];

    expect(after).not.toBe(before);
    expect(after).toHaveAttribute("stroke-dasharray", "82 100");
    expect(after?.getAttribute("style")).toContain("--gauge-dash: 82");
  });

  it("저축액·비율·양끝 라벨을 노출한다", () => {
    const { getByText } = render(
      <SemicircleGauge maxLabel="5,000만원" minLabel="0" percent={39} savedLabel="1,950만원" />,
    );
    expect(getByText("1,950만원")).toBeInTheDocument();
    expect(getByText("39%")).toBeInTheDocument();
    expect(getByText("5,000만원")).toBeInTheDocument();
  });

  // 피그마(node 2215:20074)에서 호는 카드 폭을 꽉 채우지 않고 78%만 차지한다 —
  // w-full로 되돌아가면 실제보다 굵고 넓게 그려진다.
  it("호를 카드 폭 그대로 채우지 않는다", () => {
    const { container } = render(
      <SemicircleGauge maxLabel="5,000만원" minLabel="0" percent={39} savedLabel="1,950만원" />,
    );
    expect(container.querySelector(".max-w-\\[78\\%\\]")).toBeInTheDocument();
  });

  it("중앙 수치를 피그마 위치에 맞춘다", () => {
    const { container, getByText } = render(
      <SemicircleGauge maxLabel="5,000만원" minLabel="0" percent={39} savedLabel="1,950만원" />,
    );

    expect(container.querySelector(".top-\\[44\\%\\]")).toBeInTheDocument();
    expect(getByText("1,950만원")).toHaveClass("whitespace-nowrap");
  });

  /**
   * 시안은 끝 라벨을 호 끝점 바로 아래 가운데에 둔다. 좌우 정렬(justify-between)로 두면
   * "0"이 호 끝보다 안쪽으로 들어오고 최대 라벨은 호 끝에서 15px 넘게 밀린다.
   * 호 끝점은 뷰박스(260) 기준 x=7.6과 x=252.4다.
   */
  it("끝 라벨을 호 끝점에 맞춰 세운다", () => {
    const { getByText } = render(
      <SemicircleGauge maxLabel="5,000만원" minLabel="0" percent={39} savedLabel="1,950만원" />,
    );

    expect(Number.parseFloat(getByText("0").style.left)).toBeCloseTo(
      (ARC_START_X / VIEWBOX_WIDTH) * 100,
      3,
    );
    expect(Number.parseFloat(getByText("5,000만원").style.left)).toBeCloseTo(
      (ARC_END_X / VIEWBOX_WIDTH) * 100,
      3,
    );
  });

  /**
   * 끝점이 반지름과 어긋나면 브라우저가 중심을 다시 잡아 정점이 뷰박스 위로 올라가 잘린다.
   * 시안 링은 중심 (130,130)·반지름 122.5이고 180°를 넘으므로 large-arc-flag가 1이다.
   */
  it("호가 시안 링과 같은 원 위에 있다", () => {
    const { container } = render(
      <SemicircleGauge maxLabel="5,000만원" minLabel="0" percent={0} savedLabel="0만원" />,
    );

    expect(container.querySelector("svg")).toHaveAttribute("viewBox", "0 0 260 142");
    expect(container.querySelector("path")).toHaveAttribute("d", ARC_PATH);
    expect(ARC_PATH).toContain("A 122.5 122.5 0 1 1");
    // 끝점과 중심(130,130)의 거리가 반지름과 같아야 한다.
    expect(Math.hypot(ARC_END_X - 130, 134.5 - 130)).toBeCloseTo(122.5, 6);
  });

  // 트랙은 시안에서 Gray/100이다. Gray/200을 쓰면 채운 부분과의 대비가 과하게 세다.
  it("트랙을 시안 색으로 그린다", () => {
    // percent 0이면 path가 트랙 하나뿐이라 렌더 순서에 기대지 않는다.
    const { container } = render(
      <SemicircleGauge maxLabel="5,000만원" minLabel="0" percent={0} savedLabel="0만원" />,
    );

    expect(container.querySelector("path")).toHaveAttribute("stroke", "var(--color-gray-100)");
  });
});
