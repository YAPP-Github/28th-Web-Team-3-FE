"use client";

import { Button, Toggle } from "@repo/ui";
import { useRouter } from "next/navigation";
import { useState } from "react";

const AGE_OPTIONS = ["10대", "20대", "30대", "40대", "50대", "60대 이상"] as const;

export default function AgeOnboardingPage() {
  const router = useRouter();
  const [selectedAge, setSelectedAge] = useState<(typeof AGE_OPTIONS)[number] | null>(null);

  return (
    <div className="flex min-h-[calc(100dvh-56px)] flex-col px-5 pt-8">
      <section>
        <h1 className="text-headline-h2-700 text-black">나이가 어떻게 되시나요?</h1>
        <p className="mt-1 text-body-b1-400 text-gray-700">
          연령대에 맞는 정보를 드리기 위해 필요해요.
        </p>
        <div className="mt-8 grid grid-cols-2 gap-3">
          {AGE_OPTIONS.map((age) => (
            <Toggle
              key={age}
              pressed={selectedAge === age}
              variant="onboarding"
              onPressedChange={(pressed) => {
                setSelectedAge(pressed ? age : null);
              }}
            >
              {age}
            </Toggle>
          ))}
        </div>
      </section>
      <Button
        className="mt-auto mb-6 disabled:bg-gray-50 disabled:text-gray-300 disabled:opacity-100"
        disabled={selectedAge === null}
        size="cta"
        onClick={() => router.push("/onboarding/month")}
      >
        다음
      </Button>
    </div>
  );
}
