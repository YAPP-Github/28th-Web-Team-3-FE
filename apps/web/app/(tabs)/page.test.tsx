import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import HomePage from "./page";

describe("HomePage", () => {
  it("제목과 모으기 라인이 렌더된다", () => {
    render(<HomePage />);

    expect(screen.getByRole("heading", { name: "홈" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /5,000만원 모으기/ })).toHaveAttribute("href", "/goal");
  });
});
