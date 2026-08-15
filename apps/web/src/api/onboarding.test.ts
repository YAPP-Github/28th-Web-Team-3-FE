import { HTTPError } from "ky";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { http } from "@/api/client";
import {
  confirmOnboardingGoal,
  getOnboardingGoalPlans,
  getOnboardingProfile,
  getOnboardingReport,
  patchOnboardingProfile,
  updateOnboardingProfile,
} from "@/api/onboarding";

vi.mock("@/api/client", () => ({
  http: { get: vi.fn(), patch: vi.fn(), post: vi.fn(), put: vi.fn() },
}));

const profile = {
  status: "IN_PROGRESS",
  birthDate: "1998-03-01",
  monthlySalaryManwon: 300,
  monthlySavingManwon: 100,
  netWorthManwon: 1000,
  goalPeriodMonths: 24,
};

/** `http`는 응답 계약을 이미 적용해 돌려주므로, 목은 검증된 값을 그대로 내놓는다. */
function resolved(value: unknown) {
  return Promise.resolve(value) as never;
}

function httpError(status: number, name: string) {
  const error = Object.create(HTTPError.prototype) as HTTPError;
  Object.assign(error, { response: new Response(null, { status }), data: { name } });
  return Promise.reject(error) as never;
}

describe("onboarding API", () => {
  beforeEach(() => vi.clearAllMocks());

  it("profile을 조회하고 부분 저장한다", async () => {
    vi.mocked(http.get).mockReturnValue(resolved(profile));
    vi.mocked(http.patch).mockReturnValue(resolved(profile));

    await expect(getOnboardingProfile()).resolves.toEqual(profile);
    await patchOnboardingProfile({ birthDate: "1998-03-01" });

    expect(http.get).toHaveBeenCalledWith("onboarding/profile", expect.anything());
    expect(http.patch).toHaveBeenCalledWith(
      "onboarding/profile",
      expect.objectContaining({
        body: { birthDate: "1998-03-01" },
        request: expect.anything(),
      }),
    );
  });

  it("완료한 사용자의 profile을 PUT으로 수정한다", async () => {
    vi.mocked(http.put).mockReturnValue(resolved(profile));

    await updateOnboardingProfile({
      birthDate: "1998-03-01",
      monthlySalaryManwon: 300,
      monthlySavingManwon: 100,
      netWorthManwon: 1000,
      goalPeriodMonths: 24,
    });

    expect(http.put).toHaveBeenCalledWith(
      "onboarding/profile",
      expect.objectContaining({
        body: {
          birthDate: "1998-03-01",
          monthlySalaryManwon: 300,
          monthlySavingManwon: 100,
          netWorthManwon: 1000,
          goalPeriodMonths: 24,
        },
        request: expect.anything(),
        response: expect.anything(),
      }),
    );
  });

  it("신규 게스트의 프로필 없음 응답을 IN_PROGRESS로 정규화한다", async () => {
    vi.mocked(http.get).mockReturnValue(httpError(404, "ONBOARDING_PROFILE_NOT_FOUND"));

    await expect(getOnboardingProfile()).resolves.toEqual({
      status: "IN_PROGRESS",
      birthDate: null,
      monthlySalaryManwon: null,
      monthlySavingManwon: null,
      netWorthManwon: null,
      goalPeriodMonths: null,
    });
  });

  it("프로필 없음 이외의 오류는 호출부로 전파한다", async () => {
    vi.mocked(http.get).mockReturnValue(httpError(401, "UNAUTHORIZED"));

    await expect(getOnboardingProfile()).rejects.toBeInstanceOf(HTTPError);
  });

  it("report, goal-plans, goal 계약 경로를 호출한다", async () => {
    vi.mocked(http.get).mockReturnValue(resolved({}));
    vi.mocked(http.post).mockReturnValue(resolved({}));

    await getOnboardingReport();
    await getOnboardingGoalPlans();
    await confirmOnboardingGoal({ plan: "PLAN_1" });

    expect(http.get).toHaveBeenNthCalledWith(1, "onboarding/report", expect.anything());
    expect(http.get).toHaveBeenNthCalledWith(2, "onboarding/goal-plans", expect.anything());
    expect(http.post).toHaveBeenCalledWith(
      "onboarding/goal",
      expect.objectContaining({
        body: { plan: "PLAN_1" },
        request: expect.anything(),
      }),
    );
  });
});
