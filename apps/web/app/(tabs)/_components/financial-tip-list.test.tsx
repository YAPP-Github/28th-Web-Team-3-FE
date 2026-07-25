import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { BENEFITS, FINANCIAL_TIPS } from "@/app/(tabs)/benefits/constants";
import { FinancialTipList } from "./financial-tip-list";

describe("FinancialTipList", () => {
  it("대응하는 정책이 있는 팁은 혜택 카드와 같은 공식 URL로 연결한다", () => {
    render(<FinancialTipList tips={FINANCIAL_TIPS} />);

    const benefit = BENEFITS.find((item) => item.id === "youth-future-savings");
    const link = screen.getByRole("link", { name: /청년 미래적금/ });

    expect(link).toHaveAttribute("href", benefit?.officialUrl);
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noreferrer noopener");
  });

  it("대응하는 정책이 없는 팁은 링크로 만들지 않는다", () => {
    render(<FinancialTipList tips={FINANCIAL_TIPS} />);

    expect(screen.getByText("배달비만 줄여도 쏠쏠해요")).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /배달비/ })).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /구독/ })).not.toBeInTheDocument();
  });
});
