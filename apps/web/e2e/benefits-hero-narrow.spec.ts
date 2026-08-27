import { expect, type Page, test } from "./fixtures";

/**
 * 좁은 화면에서 히어로 문구가 깨지지 않아야 한다.
 *
 * 일러스트가 `shrink-0`으로 148px에 고정돼 있어, 화면이 375보다 좁아지면 줄어드는 쪽이
 * 일러스트가 `shrink-0`으로 148px에 고정돼 있어, 화면이 375보다 좁아지면 줄어드는 쪽이
 * 문구뿐이었다. Z Flip 4(360px)에서 두 줄이어야 할 "지금 바로 신청하기 / 좋은 혜택"이
 * "지금 바로 신청하 / 기 / 좋은 혜택" 세 줄로 끊겼다.
 */
const HEADING_LINES = 2;

/** 시안 폭(375) 이상에서는 일러스트가 원래 크기를 지킨다. */
const ILLUSTRATION_WIDTH = 148;

async function gotoBenefits(page: Page, width: number) {
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
      body: JSON.stringify([
        {
          id: 1,
          title: "청년일자리 도약장려금",
          description: "취업이 어려운 청년을 정규직으로 채용하면 지원합니다.",
          category: "금융",
          bookmarked: false,
        },
      ]),
    }),
  );

  await page.setViewportSize({ width, height: 800 });
  await page.goto("/benefits");
  await expect(page.getByText("청년일자리 도약장려금")).toBeVisible();
}

function measureHero(page: Page) {
  return page.evaluate(() => {
    const heading = [...document.querySelectorAll("p")].find((el) =>
      el.textContent?.includes("지금 바로 신청하기"),
    );
    const art = document.querySelector<HTMLElement>('[data-slot="benefit-hero-illustration"]');
    if (!heading || !art) return null;
    const lineHeight = Number.parseFloat(getComputedStyle(heading).lineHeight);
    const box = art.getBoundingClientRect();
    return {
      lines: Math.round(heading.getBoundingClientRect().height / lineHeight),
      artWidth: Math.round(box.width),
      artHeight: Math.round(box.height),
      overflows: document.documentElement.scrollWidth > document.documentElement.clientWidth,
    };
  });
}

// 320은 아직 쓰이는 가장 좁은 안드로이드 폭, 360은 Z Flip 4, 375는 시안 기준.
for (const width of [320, 360, 375, 412]) {
  test(`${width}px에서 히어로 문구가 두 줄로 유지된다`, async ({ page }) => {
    await gotoBenefits(page, width);

    const hero = await measureHero(page);

    expect(hero?.lines).toBe(HEADING_LINES);
    expect(hero?.overflows).toBe(false);
    // 좁아진 만큼은 일러스트가 감당하되, 비율(148:104)은 유지한다.
    expect(hero?.artHeight).toBe(Math.round(((hero?.artWidth ?? 0) * 104) / 148));
    if (width >= 375) expect(hero?.artWidth).toBe(ILLUSTRATION_WIDTH);
    else expect(hero?.artWidth).toBeLessThan(ILLUSTRATION_WIDTH);
  });
}
