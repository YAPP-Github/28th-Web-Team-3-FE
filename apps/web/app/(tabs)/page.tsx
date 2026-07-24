"use client";

import { Button } from "@repo/ui";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { NativeFeatures } from "@/app/native-features";
import { getOnboardingProfile } from "@/lib/onboarding";

export default function HomePage() {
  const router = useRouter();
  const [isOnboardingChecked, setIsOnboardingChecked] = useState(false);
  const [hasProfileError, setHasProfileError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    setHasProfileError(false);
    getOnboardingProfile()
      .then((profile) => {
        if (profile.status === "IN_PROGRESS") {
          router.replace("/onboarding/intro");
          return;
        }

        setIsOnboardingChecked(true);
      })
      .catch(() => {
        setHasProfileError(true);
      });
  }, [retryCount, router]);

  if (hasProfileError) {
    return (
      <main className="flex flex-1 flex-col items-center justify-center gap-4 px-5 text-center">
        <p className="text-body-b1-500 text-gray-700">
          사용자 정보를 불러오지 못했어요.
          <br />
          잠시 후 다시 시도해주세요.
        </p>
        <Button size="cta" className="max-w-52" onClick={() => setRetryCount((count) => count + 1)}>
          다시 시도
        </Button>
      </main>
    );
  }

  if (!isOnboardingChecked) {
    return <main aria-busy="true" className="flex flex-1" />;
  }

  return (
    <main className="flex flex-1 flex-col justify-center gap-6 p-6">
      <div className="space-y-2">
        <h1 className="font-semibold text-2xl">Web Team 3</h1>
        <p className="text-muted-foreground text-sm">
          Next.js 웹 + Expo WebView 셸이 UI·스키마·API를 공유합니다.
        </p>
      </div>

      {/* Native-only actions (share / biometric). Hidden in a plain browser. */}
      <NativeFeatures />
    </main>
  );
}
