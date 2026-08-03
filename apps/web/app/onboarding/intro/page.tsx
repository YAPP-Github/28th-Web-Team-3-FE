import { buttonVariants, cn } from "@repo/ui";
import Link from "next/link";

export default function IntroOnboardingPage() {
  return (
    <div className="flex min-h-dvh flex-col px-5 pt-20">
      <h1 className="text-headline-h2-700 text-black">
        반가워요!
        <br />
        <span className="text-blue-600">자산</span>을 모으기 위해
        <br />몇 가지만 확인할게요.
      </h1>
      <Link
        className={cn(buttonVariants({ size: "cta", variant: "onboardingNext" }), "mt-auto mb-6")}
        href="/onboarding/age"
        replace
      >
        시작
      </Link>
    </div>
  );
}
