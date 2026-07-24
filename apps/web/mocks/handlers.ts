import type { GoalStatus, GoalUpdateRequest, SavingRequest } from "@repo/schema/goal";
import { HttpResponse, http, type RequestHandler } from "msw";

// BE 연동 전 개발/테스트용 목 상태. 요청 간 값이 유지돼 저축 입력·목표 수정이 화면에 반영된다.
const goal: GoalStatus = {
  targetAmountManwon: 5000,
  totalSavedManwon: 1950,
  progressPercent: 39,
  usageMonths: 8,
  deadlineDDay: 486,
  thisMonth: {
    targetManwon: 82,
    savedManwon: 67,
    progressPercent: 82,
    dday: 12,
  },
};

function recalcPercent() {
  goal.progressPercent =
    goal.targetAmountManwon > 0
      ? Math.min(100, Math.round((goal.totalSavedManwon / goal.targetAmountManwon) * 100))
      : 0;
}

// baseUrl이 절대(NEXT_PUBLIC_API_URL)든 상대("/")든 잡도록 와일드카드로 매칭한다.
export const handlers: RequestHandler[] = [
  http.get("*/api/goal", () => HttpResponse.json(goal)),

  http.put("*/api/goal/savings", async ({ request }) => {
    const { savedAmountManwon } = (await request.json()) as SavingRequest;
    goal.totalSavedManwon = savedAmountManwon;
    recalcPercent();
    return new HttpResponse(null, { status: 204 });
  }),

  http.patch("*/api/goal", async ({ request }) => {
    const body = (await request.json()) as GoalUpdateRequest;
    if (body.targetAmountManwon != null) goal.targetAmountManwon = body.targetAmountManwon;
    recalcPercent();
    return new HttpResponse(null, { status: 204 });
  }),
];
