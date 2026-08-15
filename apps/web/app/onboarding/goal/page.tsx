import { redirect } from "next/navigation";

/** 이전 앱 히스토리와 딥링크는 선택 화면 대신 새 최종 결과 화면으로 보낸다. */
export default function LegacyOnboardingGoalPage() {
  redirect("/onboarding/result");
}
