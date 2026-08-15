import { buttonVariants, cn } from "@repo/ui";
import IntroCoin from "@repo/ui/svg/intro-coin.svg";
import Link from "next/link";

export default function IntroOnboardingPage() {
  return (
    <div className="flex min-h-dvh flex-col px-5 pt-20">
      <h1 className="text-headline-h2-700 text-black">
        반가워요!
        <br />
        <div className="flex flex-col text-blue-600">
          <div className="flex flex-row items-center gap-1">
            저축에 도전할 <IntroCoin />
          </div>
          목표 금액을 추천하기 위해
        </div>
        몇 가지만 확인할게요.
      </h1>
      <Link
        className={cn(buttonVariants({ size: "cta", variant: "onboardingNext" }), "mt-auto mb-6")}
        href="/onboarding/age"
      >
        시작
      </Link>
    </div>
  );
}
