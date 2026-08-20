import { describe, expect, it } from "vitest";
import { render, screen } from "@/lib/test/react";
import { LoadingRegion } from "./loading-region";

describe("LoadingRegion", () => {
  it("레이블이 있으면 상태 라이브 리전으로 알린다", () => {
    render(
      <LoadingRegion label="목표를 불러오는 중">
        <div aria-hidden="true" />
      </LoadingRegion>,
    );

    expect(screen.getByRole("status")).toHaveTextContent("목표를 불러오는 중");
  });

  it("레이블이 없으면 라이브 리전을 만들지 않는다", () => {
    render(
      <LoadingRegion>
        <span>내용</span>
      </LoadingRegion>,
    );

    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });
});
