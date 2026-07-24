import { HTTPError } from "ky";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { api } from "@/lib/api";
import {
  confirmOnboardingGoal,
  getOnboardingGoalPlans,
  getOnboardingProfile,
  getOnboardingReport,
  patchOnboardingProfile,
} from "@/lib/onboarding";

vi.mock("@/lib/api", () => ({
  api: { get: vi.fn(), patch: vi.fn(), post: vi.fn() },
}));

const profile = {
  status: "IN_PROGRESS",
  birthDate: "1998-03-01",
  monthlySalaryManwon: 300,
  monthlySavingManwon: 100,
  netWorthManwon: 1000,
  goalPeriodMonths: 24,
};

function response(value: unknown) {
  return { json: vi.fn().mockResolvedValue(value) };
}

function errorResponse(status: number, name: string) {
  const error = Object.create(HTTPError.prototype) as HTTPError;
  Object.assign(error, {
    response: new Response(null, { status }),
    data: { name },
  });
  return { json: vi.fn().mockRejectedValue(error) };
}

describe("onboarding API", () => {
  beforeEach(() => vi.clearAllMocks());

  it("profile을 조회하고 부분 저장한다", async () => {
    vi.mocked(api.get).mockReturnValue(response(profile) as unknown as ReturnType<typeof api.get>);
    vi.mocked(api.patch).mockReturnValue(
      response(profile) as unknown as ReturnType<typeof api.patch>,
    );

    await expect(getOnboardingProfile()).resolves.toEqual(profile);
    await patchOnboardingProfile({ birthDate: "1998-03-01" });

    expect(api.get).toHaveBeenCalledWith("onboarding/profile");
    expect(api.patch).toHaveBeenCalledWith("onboarding/profile", {
      json: { birthDate: "1998-03-01" },
    });
  });

  it("신규 게스트의 프로필 없음 응답을 IN_PROGRESS로 정규화한다", async () => {
    vi.mocked(api.get).mockReturnValue(
      errorResponse(404, "ONBOARDING_PROFILE_NOT_FOUND") as unknown as ReturnType<typeof api.get>,
    );

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
    vi.mocked(api.get).mockReturnValue(
      errorResponse(401, "UNAUTHORIZED") as unknown as ReturnType<typeof api.get>,
    );

    await expect(getOnboardingProfile()).rejects.toBeInstanceOf(HTTPError);
  });

  it("report, goal-plans, goal 계약 경로를 호출한다", async () => {
    const report = {
      simulation: {
        baselineManwon: 1,
        simulationManwon: 2,
        diffManwon: 1,
        upliftPercent: 100,
        periodMonths: 12,
      },
      peer: { assetRatioPercent: 1, incomeTopPercent: 1, consumptionTopPercent: 1 },
      histogram: {
        income: { bins: [], markerManwon: 1 },
        consumption: { bins: [], markerManwon: 1 },
      },
      diagnosis: { branchCode: 1, message: "진단" },
      disclaimer: "안내",
      datasetVersion: "1",
      configVersion: "1",
    };
    const plans = { monthlySavingManwon: 100, periodMonths: 12, plans: [] };
    const goal = {
      goalId: 1,
      plan: "PLAN_1",
      periodMonths: 12,
      targetAmountManwon: 1200,
      status: "COMPLETED",
    };
    vi.mocked(api.get)
      .mockReturnValueOnce(response(report) as unknown as ReturnType<typeof api.get>)
      .mockReturnValueOnce(response(plans) as unknown as ReturnType<typeof api.get>);
    vi.mocked(api.post).mockReturnValue(response(goal) as unknown as ReturnType<typeof api.post>);

    await getOnboardingReport();
    await getOnboardingGoalPlans();
    await confirmOnboardingGoal({ plan: "PLAN_1" });

    expect(api.get).toHaveBeenNthCalledWith(1, "onboarding/report");
    expect(api.get).toHaveBeenNthCalledWith(2, "onboarding/goal-plans");
    expect(api.post).toHaveBeenCalledWith("onboarding/goal", { json: { plan: "PLAN_1" } });
  });
});
