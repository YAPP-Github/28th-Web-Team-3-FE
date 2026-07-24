"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { NativeFeatures } from "@/app/native-features";
import { getOnboardingProfile } from "@/lib/onboarding-api";

export default function HomePage() {
  const router = useRouter();
  const [isOnboardingChecked, setIsOnboardingChecked] = useState(false);

  useEffect(() => {
    getOnboardingProfile()
      .then((profile) => {
        if (profile.status === "IN_PROGRESS") {
          router.replace("/onboarding/intro");
          return;
        }

        setIsOnboardingChecked(true);
      })
      .catch(() => {
        router.replace("/onboarding/intro");
      });
  }, [router]);

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
