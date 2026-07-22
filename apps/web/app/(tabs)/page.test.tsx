import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import HomePage from "./page";

describe("HomePage", () => {
  it("제목이 렌더된다", () => {
    render(<HomePage />);

    expect(screen.getByRole("heading", { name: "Web Team 3" })).toBeInTheDocument();
  });
});
