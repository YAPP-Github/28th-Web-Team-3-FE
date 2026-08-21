import { expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@/lib/test/react";
import { BenefitsPageContent } from "./benefits-page-content";

vi.mock("./benefits-explorer", () => ({
  BenefitsExplorer: ({
    contentType,
    onContentTypeChange,
  }: {
    contentType: "policy" | "tip";
    onContentTypeChange: (contentType: "policy" | "tip") => void;
  }) => (
    <button type="button" onClick={() => onContentTypeChange("tip")}>
      {contentType}
    </button>
  ),
}));

it("절약 팁을 선택할 때만 팁 히어로 문구를 보인다", () => {
  render(<BenefitsPageContent />);

  expect(
    screen.getByText(
      (_, element) =>
        element?.tagName === "P" && (element.textContent?.includes("지금 바로 신청하기") ?? false),
    ),
  ).toBeInTheDocument();
  expect(
    screen.queryByText(
      (_, element) =>
        element?.tagName === "P" &&
        (element.textContent?.includes("지금 바로 챙기면 좋은") ?? false),
    ),
  ).not.toBeInTheDocument();

  fireEvent.click(screen.getByRole("button", { name: "policy" }));

  expect(
    screen.getByText(
      (_, element) =>
        element?.tagName === "P" &&
        (element.textContent?.includes("지금 바로 챙기면 좋은") ?? false),
    ),
  ).toBeInTheDocument();
  expect(
    screen.queryByText(
      (_, element) =>
        element?.tagName === "P" && (element.textContent?.includes("지금 바로 신청하기") ?? false),
    ),
  ).not.toBeInTheDocument();
});
