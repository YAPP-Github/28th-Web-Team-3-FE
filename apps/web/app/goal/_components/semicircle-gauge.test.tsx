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
});
