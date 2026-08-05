import { renderToString } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { BENEFITS } from "@/app/(tabs)/benefits/constants";
import { readSavedBenefits } from "@/app/(tabs)/benefits/lib/saved-benefits";
import { fireEvent, render, screen } from "@/lib/test/react";
import { BenefitsExplorer } from "./benefits-explorer";

vi.mock("@/app/(tabs)/benefits/lib/saved-benefits", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/app/(tabs)/benefits/lib/saved-benefits")>()),
  readSavedBenefits: vi.fn(),
}));

// 정적 배열이라 인덱스가 비지 않는다. noUncheckedIndexedAccess만 달래준다.
const [first, second] = BENEFITS as [(typeof BENEFITS)[number], (typeof BENEFITS)[number]];

beforeEach(() => {
  vi.mocked(readSavedBenefits).mockReturnValue(new Set());
  window.history.replaceState(null, "", "/benefits");
});

describe("BenefitsExplorer", () => {
  it("저장 칩을 누르면 저장한 것만 남는다", () => {
    vi.mocked(readSavedBenefits).mockReturnValue(new Set([second.id]));
    render(<BenefitsExplorer initialFilter="all" />);

    fireEvent.click(screen.getByRole("link", { name: "저장" }));

    expect(screen.getByText(second.title)).toBeInTheDocument();
    expect(screen.queryByText(first.title)).not.toBeInTheDocument();
  });

  it("저장한 게 없으면 안내를 띄운다", () => {
    render(<BenefitsExplorer initialFilter="all" />);

    fireEvent.click(screen.getByRole("link", { name: "저장" }));

    expect(screen.getByText(/저장한 혜택이 없어요/)).toBeInTheDocument();
  });

  it("별을 누르면 저장 목록에 들어간다", () => {
    render(<BenefitsExplorer initialFilter="all" />);

    fireEvent.click(screen.getByRole("button", { name: `${first.title} 저장` }));
    fireEvent.click(screen.getByRole("link", { name: "저장" }));

    expect(screen.getByText(first.title)).toBeInTheDocument();
    expect(screen.queryByText(/저장한 혜택이 없어요/)).not.toBeInTheDocument();
  });

  /**
   * localStorage는 서버에 없어 첫 페인트에는 저장 목록이 없다. 그때 빈 안내를 그리면
   * 저장한 게 있어도 "없어요"를 먼저 봤다가 목록으로 뒤집힌다.
   * `?category=saved` 딥링크와 새로고침에서 실제로 밟는 경로다.
   *
   * `render`는 이펙트까지 흘려보내 뒤집힌 뒤 상태만 보이므로, 서버가 실제로 내보내는
   * 첫 마크업을 직접 본다.
   */
  it("저장 목록을 읽기 전에는 빈 안내를 그리지 않는다", () => {
    const html = renderToString(<BenefitsExplorer initialFilter="saved" />);

    expect(html).not.toContain("저장한 혜택이 없어요");
  });
});
