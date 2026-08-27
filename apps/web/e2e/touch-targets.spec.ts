import { expect, type Page, test } from "./fixtures";

test.use({ viewport: { width: 375, height: 812 } });

/** 터치 목표 최소치. 애플·구글 접근성 지침이 공통으로 쓰는 값이다. */
const MIN_TOUCH_TARGET = 44;

async function mockCurrentUser(page: Page) {
  await page.route("**/api/auth/me", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ userId: 1, onboardingCompleted: true }),
    }),
  );
}

/** 요소의 실제 히트 영역(px). 음수 마진으로 넓힌 부분까지 포함된다. */
function boxOf(page: Page, name: string, exact = true) {
  return page.getByRole("link", { name, exact }).or(page.getByRole("button", { name, exact }));
}

test("목표 상세 수정 링크가 터치 목표 높이를 채운다", async ({ page }) => {
  await mockCurrentUser(page);
  await page.route("**/api/v2/goal", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        targetAmountManwon: 5000,
        periodMonths: 16,
        totalSavedManwon: 1950,
        progressPercent: 39,
        usageMonths: 8,
        deadlineDDay: 240,
        thisMonth: { targetManwon: 190, savedManwon: 100, progressPercent: 53, dDay: 12 },
        monthlySavings: [{ yearMonth: "2026-08", savedManwon: 100, current: true }],
      }),
    }),
  );

  await page.goto("/goal");
  const edit = boxOf(page, "수정");
  await expect(edit).toBeVisible();

  const box = await edit.boundingBox();
  expect(box?.height).toBeGreaterThanOrEqual(MIN_TOUCH_TARGET);
});

test("혜택 카드의 저장 별과 설명 펼침이 같은 터치 목표를 쓴다", async ({ page }) => {
  await mockCurrentUser(page);
  await page.route("**/api/policies**", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify([
        {
          id: 1,
          title: "청년 지원 정책",
          description: "만 19~34세 청년에게 월 20만원을 지원합니다.",
          category: "주거",
          bookmarked: false,
        },
      ]),
    }),
  );

  await page.goto("/benefits");
  await expect(page.getByText("청년 지원 정책")).toBeVisible();

  const star = boxOf(page, "청년 지원 정책 저장");
  const expand = boxOf(page, "청년 지원 정책 설명 펼치기");
  const [starBox, expandBox] = await Promise.all([star.boundingBox(), expand.boundingBox()]);

  for (const box of [starBox, expandBox]) {
    expect(box?.width).toBeGreaterThanOrEqual(MIN_TOUCH_TARGET);
    expect(box?.height).toBeGreaterThanOrEqual(MIN_TOUCH_TARGET);
  }
  // 같은 카드 안에서 기준이 갈리지 않게 한다.
  expect(expandBox?.width).toBe(starBox?.width);
  expect(expandBox?.height).toBe(starBox?.height);
});

test("마이페이지 설정 행이 눌린 표시를 낸다", async ({ page }) => {
  await mockCurrentUser(page);
  await page.goto("/mypage");
  await expect(page.getByRole("heading", { name: "마이페이지" })).toBeVisible();

  /*
   * 터치 기기에는 `hover:`가 걸리지 않는다(Tailwind v4가 `@media (hover: hover)`로 감싼다).
   * 눌렀을 때 실제로 색이 변하는지를 `active:` 규칙이 붙어 있는지로 확인한다.
   */
  const rows = await page.evaluate(() =>
    ["내 정보", "이용약관", "개인정보처리방침", "문의하기", "탈퇴하기"].map((label) => {
      const el = [...document.querySelectorAll("a, button")].find(
        (node) => node.textContent?.trim() === label,
      );
      const cls = el?.className.toString() ?? "";
      return {
        label,
        found: Boolean(el),
        active: /active:bg-/.test(cls),
        focus: /focus-visible:ring/.test(cls),
      };
    }),
  );

  for (const row of rows) {
    expect(row, row.label).toMatchObject({ found: true, active: true, focus: true });
  }
});
