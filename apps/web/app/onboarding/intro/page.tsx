import { Button } from "@repo/ui";
import Link from "next/link";

export default function IntroOnboardingPage() {
  return (
    <div className="flex min-h-dvh flex-col px-5 pt-20">
      <h1 className="text-headline-h2-700 text-black">
        반가워요!
        <br />
        <span className="text-blue-600">딱 맞는 투자 선배</span>를 찾기 위해
        <br />몇 가지만 확인할게요.
      </h1>
      <Link className="mt-auto mb-6" href="/onboarding/age" passHref>
        <Button size="cta" variant="onboardingNext">
          시작
        </Button>
      </Link>
    </div>
  );
}
