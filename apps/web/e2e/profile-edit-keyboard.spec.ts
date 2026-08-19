import { expect, type Page, test } from "@playwright/test";

test.use({ viewport: { width: 375, height: 812 } });

/** 아이폰 숫자 키보드(제안 줄 없음) 높이 — 키패드 220 + 컨트롤러 71. */
const KEYBOARD_INSET = 291;

async function gotoProfileEdit(page: Page) {
  await page.route("**/api/auth/me", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ userId: 1, onboardingCompleted: true }),
    }),
  );
  await page.route("**/api/onboarding/profile", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        status: "COMPLETED",
        birthDate: "2002-10-24",
        address: "SEOUL",
        monthlySalaryManwon: 500,
        monthlySavingManwon: 100,
        netWorthManwon: 5000,
        goalPeriodMonths: 36,
      }),
    }),
  );

  await page.goto("/profile/edit");
}

/**
 * `<legend>`는 fieldset 안에서 flex 항목이 되지 않아 `gap`이 걸리지 않는다 — 12px를
 * 줬는데도 라벨과 칩이 0px로 붙어 있었다. 간격은 legend의 margin으로 준다.
 */
test("기간 라벨과 칩 사이가 시안의 12px만큼 떨어진다", async ({ page }) => {
  await gotoProfileEdit(page);
  await expect(page.getByRole("button", { name: "완료" })).toBeVisible();

  const gap = await page.evaluate(() => {
    const legend = [...document.querySelectorAll("legend")].find((el) =>
      el.textContent?.includes("자산을 모으고 싶은 기간"),
    );
    const chip = [...document.querySelectorAll("button")].find(
      (el) => el.textContent?.trim() === "1년 미만",
    );
    if (!legend || !chip) return null;
    return Math.round(chip.getBoundingClientRect().top - legend.getBoundingClientRect().bottom);
  });

  expect(gap).toBe(12);
});

test("키보드가 올라와도 완료 버튼이 키보드 위에 남는다", async ({ page }) => {
  await gotoProfileEdit(page);
  const submit = page.getByRole("button", { name: "완료" });
  await expect(submit).toBeVisible();

  // 실제 키보드는 헤드리스 브라우저에서 뜨지 않는다. `KeyboardInsetSync`가 쓰는 값을 직접
  // 넣어 키보드가 올라온 상태를 만든다.
  await page.evaluate(
    (inset) => document.documentElement.style.setProperty("--keyboard-inset", `${inset}px`),
    KEYBOARD_INSET,
  );
  await page.getByLabel("월급").focus();

  // 버튼 아래 여백(12px)만 남기고 키보드 바로 위에 붙는다.
  await expect
    .poll(async () => {
      const box = await submit.boundingBox();
      return box && Math.round(box.y + box.height);
    })
    .toBe(812 - KEYBOARD_INSET - 12);
});
