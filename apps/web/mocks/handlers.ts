import type { GoalStatus, GoalUpdateRequest, SavingRequest } from "@repo/schema/goal";
import { HttpResponse, http, type RequestHandler } from "msw";

// ENABLE_API_MOCKS=true로 UI만 독립 개발할 때와 테스트에서 쓰는 목 상태.
// 기본 개발 실행은 실 API를 사용한다.
const goal: GoalStatus = {
  targetAmountManwon: 5000,
  periodMonths: 16,
  totalSavedManwon: 1950,
  progressPercent: 39,
  usageMonths: 8,
  deadlineDDay: 486,
  thisMonth: {
    targetManwon: 82,
    savedManwon: 67,
    progressPercent: 82,
    dDay: 12,
  },
  monthlySavings: [
    { yearMonth: "2026-03", savedManwon: 0, current: false },
    { yearMonth: "2026-04", savedManwon: 0, current: false },
    { yearMonth: "2026-05", savedManwon: 71, current: false },
    { yearMonth: "2026-06", savedManwon: 80, current: false },
    { yearMonth: "2026-07", savedManwon: 0, current: false },
    { yearMonth: "2026-08", savedManwon: 67, current: true },
  ],
};

function recalcPercent() {
  goal.progressPercent =
    goal.targetAmountManwon > 0
      ? Math.min(100, Math.round((goal.totalSavedManwon / goal.targetAmountManwon) * 100))
      : 0;
}

// baseUrl이 절대(NEXT_PUBLIC_API_URL)든 상대("/")든 잡도록 와일드카드로 매칭한다.
// 미션(목록/complete/생성)은 실서버로 연동됐으므로 목을 두지 않는다 — 목이 있으면
// bypass되지 않고 정적 응답으로 가로채져 실제 데이터가 화면에 안 뜬다.
export const handlers: RequestHandler[] = [
  http.get("*/api/v2/goal", () => HttpResponse.json(goal)),

  http.put("*/api/goal/savings", async ({ request }) => {
    const { savedAmountManwon } = (await request.json()) as SavingRequest;
    goal.totalSavedManwon = goal.totalSavedManwon - goal.thisMonth.savedManwon + savedAmountManwon;
    goal.thisMonth.savedManwon = savedAmountManwon;
    const currentMonth = goal.monthlySavings.find(({ current }) => current);
    if (currentMonth) currentMonth.savedManwon = savedAmountManwon;
    goal.thisMonth.progressPercent =
      goal.thisMonth.targetManwon > 0
        ? Math.min(100, Math.round((savedAmountManwon / goal.thisMonth.targetManwon) * 100))
        : 0;
    recalcPercent();
    return HttpResponse.json(goal);
  }),

  http.patch("*/api/goal", async ({ request }) => {
    const body = (await request.json()) as GoalUpdateRequest;
    if (body.targetAmountManwon != null) goal.targetAmountManwon = body.targetAmountManwon;
    if (body.periodMonths != null) goal.periodMonths = body.periodMonths;
    recalcPercent();
    return HttpResponse.json(goal);
  }),
];
