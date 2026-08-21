import { expect, type Page, test } from "@playwright/test";

test.use({ viewport: { width: 375, height: 812 } });

/**
 * 두 탭 모두 "보여줄 게 없다"는 문구만 남는데, 탭을 바꾸면 문구가 위아래로 움직였다.
 * 문구가 서로 다른 부모에 있어(팁은 탭 패널 직속, 정책은 목록 `section` 안) 여백이 갈렸다.
 */
async function gotoSavedWithNothing(page: Page) {
  await page.route("**/api/auth/me", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ userId: 1, onboardingCompleted: true }),
    }),
  );
  await page.route("**/api/bookmarks**", (route) =>
    route.fulfill({ status: 200, contentType: "application/json", body: "[]" }),
  );
  await page.route("**/api/tips**", (route) =>
    route.fulfill({ status: 200, contentType: "application/json", body: "[]" }),
  );

  await page.goto("/benefits/saved");
}

/** 여백을 뺀 실제 글자 시작 위치를 탭 아래 기준으로 잰다. */
function measureMessageTop(page: Page, text: string) {
  return page.evaluate((needle) => {
    const paragraph = [...document.querySelectorAll("p")].find((node) =>
      node.textContent?.includes(needle),
    );
    const tabs = document.querySelector('[role="tablist"]');
    if (!paragraph || !tabs) return null;
    const range = document.createRange();
    range.selectNodeContents(paragraph);
    return Math.round(range.getBoundingClientRect().top - tabs.getBoundingClientRect().bottom);
  }, text);
}

test("두 탭의 빈 상태 문구가 같은 자리에 선다", async ({ page }) => {
  await gotoSavedWithNothing(page);

  await expect(page.getByText("저장한 혜택이 없어요.")).toBeVisible();
  const policyTop = await measureMessageTop(page, "저장한 혜택이 없어요.");

  await page.getByRole("tab", { name: "절약 팁" }).click();
  await expect(page.getByText("저장한 절약 팁이 없어요.")).toBeVisible();
  const tipTop = await measureMessageTop(page, "저장한 절약 팁이 없어요.");

  expect(policyTop).not.toBeNull();
  expect(policyTop).toBe(tipTop);
});
