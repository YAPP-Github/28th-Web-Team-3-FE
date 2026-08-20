import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@/lib/test/react";

const navigation = vi.hoisted(() => ({ pathname: "/" }));

vi.mock("next/navigation", () => ({
  usePathname: () => navigation.pathname,
}));

import { BottomNav } from "./bottom-nav";

describe("BottomNav", () => {
  beforeEach(() => {
    navigation.pathname = "/";
  });

  it("현재 경로를 주요 메뉴의 현재 페이지로 표시한다", () => {
    navigation.pathname = "/mission/new";
    render(<BottomNav />);

    expect(screen.getByRole("navigation", { name: "주요 메뉴" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "미션" })).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("link", { name: "홈" })).not.toHaveAttribute("aria-current");
  });
});
