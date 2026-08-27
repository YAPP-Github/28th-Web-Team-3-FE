import { expect, test } from "./fixtures";

test.use({ viewport: { width: 375, height: 812 } });

const PROFILE = {
  status: "IN_PROGRESS",
  birthDate: "1998-03-01",
  address: "SEOUL",
  monthlySalaryManwon: 300,
  monthlySavingManwon: 100,
  netWorthManwon: 1000,
  goalPeriodMonths: 24,
};

/** 저장 응답을 붙잡아 "다음"이 처리 중인 순간을 열어 둔다. */
async function gotoPeriodWithSlowSave(page: import("@playwright/test").Page) {
  await page.route("**/api/auth/me", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ userId: 1, onboardingCompleted: false }),
    }),
  );
  await page.route("**/api/onboarding/profile", async (route) => {
    if (route.request().method() === "GET") {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(PROFILE),
      });
      return;
    }
    await new Promise((resolve) => setTimeout(resolve, 5_000));
    await route.fulfill({ status: 200, contentType: "application/json", body: "{}" });
  });

  await page.goto("/onboarding/period");
}

/**
 * "다음"을 눌러도 반응이 없어 보인다는 제보. 눌린 표시가 2%짜리 크기 변화뿐이라
 * 네트워크가 도는 동안 화면에서 눈에 띄게 변하는 게 없었다 — 스피너로 진행 중임을 보인다.
 */
test("다음을 누르면 처리 중 스피너를 보이면서 버튼 이름은 유지한다", async ({ page }) => {
  await gotoPeriodWithSlowSave(page);
  const next = page.getByRole("button", { name: "다음" });
  await expect(next).toBeEnabled();
  expect(await next.locator("svg").count()).toBe(0);

  await next.click({ noWaitAfter: true });

  await expect(next).toHaveAttribute("aria-busy", "true");
  await expect(next.locator("svg")).toHaveCount(1);
  // 문구를 지우거나 바꾸면 스크린리더가 이름이 바뀐 것으로 읽는다 — 투명하게만 만든다.
  await expect(next).toHaveAccessibleName("다음");
});

/**
 * "다음을 눌렀는데 이전이 눌린 것처럼 보인다"는 제보. 처리 중 이전 버튼이
 * `disabled:opacity-50`으로 흐려져, 화면에서 제일 크게 변하는 게 그쪽이었다.
 */
test("다음이 처리 중이어도 이전 버튼이 흐려지지 않는다", async ({ page }) => {
  await gotoPeriodWithSlowSave(page);
  const next = page.getByRole("button", { name: "다음" });
  // 헤더의 "이전 단계" 버튼과 구분한다.
  const prev = page.getByRole("button", { name: "이전", exact: true });
  const opacity = () => prev.evaluate((el) => getComputedStyle(el).opacity);
  expect(await opacity()).toBe("1");

  await next.click({ noWaitAfter: true });
  await expect(next).toHaveAttribute("aria-busy", "true");

  expect(await opacity()).toBe("1");
  // 보이기만 그대로일 뿐, 저장 중에 뒤로 가는 것은 그대로 막는다.
  await expect(prev).toBeDisabled();
});
