import { describe, expect, it } from "vitest";
import { render, screen } from "@/lib/test/react";
import MyPage from "./page";

describe("MyPage", () => {
  it("내 정보 조회 화면으로 이동하는 링크를 제공한다", () => {
    render(<MyPage />);

    expect(screen.getByRole("link", { name: "내 정보" })).toHaveAttribute("href", "/profile");
  });
});
