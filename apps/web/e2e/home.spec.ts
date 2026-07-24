import { expect, test } from "@playwright/test";

test("home page renders", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "홈" })).toBeVisible();
  await expect(page.getByRole("link", { name: /5,000만원 모으기/ })).toBeVisible();
});
