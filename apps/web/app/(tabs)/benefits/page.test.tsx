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

it("원화 마크의 중심을 앞쪽 카드 중심과 맞춘다", () => {
  const heroSvg = readFileSync(
    resolve(process.cwd(), "../../packages/ui/src/svg/benefit-hero.svg"),
    "utf8",
  );
  const wonSvg = readFileSync(
    resolve(process.cwd(), "../../packages/ui/src/svg/benefit-card-won.svg"),
    "utf8",
  );

  const card = heroSvg.match(/<rect x="48" y="36" width="93" height="57"/);
  const won = heroSvg.match(/<g transform="translate\(([\d.]+) ([\d.]+)\)">\s*<path/);
  const wonViewBox = wonSvg.match(/viewBox="0 0 ([\d.]+) ([\d.]+)"/);

  expect(card).not.toBeNull();
  expect(won).not.toBeNull();
  expect(wonViewBox).not.toBeNull();

  const cardCenter = { x: 48 + 93 / 2, y: 36 + 57 / 2 };
  const wonCenter = {
    x: Number(won?.[1]) + Number(wonViewBox?.[1]) / 2,
    y: Number(won?.[2]) + Number(wonViewBox?.[2]) / 2,
  };

  expect(wonCenter.x).toBeCloseTo(cardCenter.x, 3);
  expect(wonCenter.y).toBeCloseTo(cardCenter.y, 3);
});
