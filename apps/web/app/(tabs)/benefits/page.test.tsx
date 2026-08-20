import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { expect, it, vi } from "vitest";
import { render } from "@/lib/test/react";
import BenefitsPage from "./page";

vi.mock("./_components/benefits-explorer", () => ({ BenefitsExplorer: () => null }));

it("상단 그래픽을 하나의 SVG 좌표계로 렌더한다", () => {
  const { container } = render(<BenefitsPage />);

  const illustration = container.querySelector('[data-slot="benefit-hero-illustration"]');
  expect(illustration?.tagName.toLowerCase()).toBe("svg");
});

it("동전을 피그마 기준 각도로 회전한다", () => {
  const svg = readFileSync(
    resolve(process.cwd(), "../../packages/ui/src/svg/benefit-hero.svg"),
    "utf8",
  );

  expect(svg).toContain("rotate(101.54");
  expect(svg).not.toContain("rotate(11.54");
});
