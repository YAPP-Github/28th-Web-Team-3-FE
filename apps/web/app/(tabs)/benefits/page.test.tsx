import { expect, it, vi } from "vitest";
import { render } from "@/lib/test/react";
import BenefitsPage from "./page";

vi.mock("./_components/benefits-explorer", () => ({ BenefitsExplorer: () => null }));

it("상단 그래픽을 하나의 SVG 좌표계로 렌더한다", () => {
  const { container } = render(<BenefitsPage />);

  const illustration = container.querySelector('[data-slot="benefit-hero-illustration"]');
  expect(illustration?.tagName.toLowerCase()).toBe("svg");
});
