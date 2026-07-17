import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { LabelSlider } from "./label-slider";

const sliderPropsSpy = vi.fn();

vi.mock("@repo/ui", () => ({
  Slider: (props: {
    max: number;
    min: number;
    onValueChange: (value: number[]) => void;
    step: number;
    thumbLabels: string[];
    value: number[];
  }) => {
    sliderPropsSpy(props);

    return (
      <button type="button" onClick={() => props.onValueChange([250])}>
        슬라이더
      </button>
    );
  },
}));

describe("LabelSlider", () => {
  it("라벨, 현재 값, 안내 문구와 최대값을 표시한다", () => {
    render(
      <LabelSlider
        amount={200}
        amountLabel="월급"
        helperMessage="월급을 선택해주세요"
        maxAmount={500}
        onAmountChange={vi.fn()}
      />,
    );

    expect(screen.getByText("월급 200만원")).toBeInTheDocument();
    expect(screen.getByText("월급을 선택해주세요")).toBeInTheDocument();
    expect(screen.getByText("0")).toBeInTheDocument();
    expect(screen.getByText("500만원")).toBeInTheDocument();
  });

  it("Slider의 값을 단일 숫자로 전달하고 변경값을 전달한다", () => {
    const onAmountChange = vi.fn();

    render(
      <LabelSlider
        amount={200}
        amountLabel="월급"
        helperMessage="월급을 선택해주세요"
        maxAmount={500}
        onAmountChange={onAmountChange}
      />,
    );

    expect(sliderPropsSpy).toHaveBeenLastCalledWith(
      expect.objectContaining({
        max: 500,
        min: 0,
        step: 10,
        thumbLabels: ["월급"],
        value: [200],
      }),
    );

    fireEvent.click(screen.getByRole("button", { name: "슬라이더" }));

    expect(onAmountChange).toHaveBeenCalledWith(250);
  });
});
