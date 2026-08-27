import { expect, type Page, test } from "./fixtures";

/**
 * 목록이 네비 밑으로 스크롤될 만큼 넉넉히, 그러나 한 페이지(20)보다는 적게.
 * 꽉 찬 페이지를 주면 무한스크롤이 끝나지 않고 같은 id를 계속 붙여 목록이 중복된다.
 */
const POLICY_COUNT = 19;

async function mockBenefits(page: Page) {
  await page.route("**/api/auth/me", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ userId: 1, onboardingCompleted: true }),
    }),
  );
  await page.route("**/api/policies**", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(
        Array.from({ length: POLICY_COUNT }, (_, index) => ({
          id: index + 1,
          title: `혜택 ${index + 1}`,
          category: "금융",
          largeCategory: "금융",
          description: "설명",
          bookmarked: false,
        })),
      ),
    }),
  );
}

async function mockSavedBenefits(page: Page) {
  await page.route("**/api/bookmarks**", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify([
        {
          contentType: "POLICY",
          id: 7,
          title: "저장한 혜택",
          category: "금융",
          description: "설명",
        },
      ]),
    }),
  );
  await page.route("**/api/policies/7", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        id: 7,
        title: "저장한 혜택",
        description: "설명",
        supportContent: null,
        category: "금융",
        largeCategory: "금융",
        mediumCategory: null,
        supervisingOrg: null,
        applyUrl: null,
        applyPeriodText: null,
        applyMethod: null,
        submitDocuments: null,
        targetMinAge: null,
        targetMaxAge: null,
        earnCondition: null,
        additionalQualification: null,
        bookmarked: true,
      }),
    }),
  );
}

/**
 * 네비에 z-index가 없으면 `auto`가 되고, 본문의 z-10 요소(저장 별)가 밑으로 스크롤돼
 * 들어올 때 네비를 뚫고 그려진다. 눈으로만 보이는 게 아니라 그 자리의 탭이 안 눌린다.
 *
 * jsdom은 페인트 순서를 모르므로 여기서(실제 CSS가 적용되는 브라우저에서) 잡는다.
 */
test("저장 별이 바텀 네비를 뚫고 올라오지 않는다", async ({ page }) => {
  await mockBenefits(page);
  await page.goto("/benefits");

  const nav = page.getByRole("navigation", { name: "주요 메뉴" });
  await expect(nav).toBeVisible();
  await expect(page.getByRole("button", { name: "혜택 1 저장" })).toBeVisible();

  // 별 하나가 네비 영역에 걸칠 때까지 내린다.
  const navBox = await nav.boundingBox();
  if (!navBox) throw new Error("네비 위치를 잴 수 없다");

  const overlapped = await page.evaluate(
    ({ navTop, navBottom }) => {
      const stars = [...document.querySelectorAll('button[aria-label$="저장"]')];
      for (let step = 0; step < 60; step += 1) {
        for (const star of stars) {
          const box = star.getBoundingClientRect();
          if (box.top < navBottom && box.bottom > navTop) {
            // 별 중심이 네비 아래로 나가면 뷰포트 밖이라 elementFromPoint가 null을 준다.
            // 그 null을 "네비를 맞췄다"로 읽으면 z-index가 없어도 통과해버린다 — 네비
            // 안쪽으로 가둬서 항상 실재하는 지점을 찍는다.
            const y = Math.min(Math.max(box.top + box.height / 2, navTop + 1), navBottom - 1);
            const point = document.elementFromPoint(box.left + box.width / 2, y);
            return {
              found: true,
              hitsNav: point !== null && point.closest('nav[aria-label="주요 메뉴"]') !== null,
            };
          }
        }
        window.scrollBy(0, 60);
      }
      return { found: false, hitsNav: false };
    },
    { navTop: navBox.y, navBottom: navBox.y + navBox.height },
  );

  expect(overlapped.found).toBe(true);
  expect(overlapped.hitsNav).toBe(true);
});

test("바텀 네비로 혜택에 들어와도 가로 넘침 없이 시안 간격을 유지한다", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 814 });
  await mockBenefits(page);
  await mockSavedBenefits(page);
  await page.goto("/benefits/saved");

  await page.getByRole("link", { name: "혜택/팁" }).click();
  await expect(page).toHaveURL("/benefits");
  await expect(page.getByRole("heading", { name: "혜택/팁" })).toBeVisible();
  await expect(page.getByRole("navigation", { name: "혜택 필터" })).toBeVisible();

  const layout = await page.evaluate(() => {
    const hero = document.querySelector<HTMLElement>("[data-safe-area-hero]");
    const tabs = document.querySelector<HTMLElement>('[role="tablist"][aria-label="혜택 종류"]');
    const filters = document.querySelector<HTMLElement>('nav[aria-label="혜택 필터"]');
    const illustration = document.querySelector<HTMLElement>(
      '[data-slot="benefit-hero-illustration"]',
    );
    if (!hero || !tabs || !filters || !illustration) throw new Error("혜택 레이아웃을 찾지 못함");

    const heroBox = hero.getBoundingClientRect();
    const tabsBox = tabs.getBoundingClientRect();
    const filtersBox = filters.getBoundingClientRect();
    const illustrationBox = illustration.getBoundingClientRect();
    return {
      horizontalOverflow:
        document.documentElement.scrollWidth - document.documentElement.clientWidth,
      tabsTopGap: tabsBox.top - heroBox.bottom,
      filtersTopGap: filtersBox.top - tabsBox.bottom,
      illustrationRight: illustrationBox.right,
    };
  });

  expect(layout.horizontalOverflow).toBe(0);
  expect(layout.tabsTopGap).toBe(10);
  expect(layout.filtersTopGap).toBe(24);
  expect(layout.illustrationRight).toBeLessThanOrEqual(355);
});
