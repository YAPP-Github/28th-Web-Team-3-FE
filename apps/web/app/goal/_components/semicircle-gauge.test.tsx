import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { SemicircleGauge } from "./semicircle-gauge";

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

    expect(Number.parseFloat(getByText("0").style.left)).toBeCloseTo((7.6 / 260) * 100, 1);
    expect(Number.parseFloat(getByText("5,000만원").style.left)).toBeCloseTo(
      (252.4 / 260) * 100,
      1,
    );
  });

  // 트랙은 시안에서 Gray/100이다. Gray/200을 쓰면 채운 부분과의 대비가 과하게 세다.
  it("트랙을 시안 색으로 그린다", () => {
    const { container } = render(
      <SemicircleGauge maxLabel="5,000만원" minLabel="0" percent={39} savedLabel="1,950만원" />,
    );

    expect(container.querySelector("path")).toHaveAttribute("stroke", "var(--color-gray-100)");
  });
});
