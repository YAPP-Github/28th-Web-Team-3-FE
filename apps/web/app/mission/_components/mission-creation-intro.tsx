import { ButtonGroup } from "@repo/ui";
import { ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import type { MissionCreationCategory } from "../constants/mission-creation";

interface MissionCreationIntroProps {
  category: MissionCreationCategory;
  onNext: () => void;
  previousHref: string;
}

export function MissionCreationIntro({
  category,
  onNext,
  previousHref,
}: MissionCreationIntroProps) {
  const router = useRouter();

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col bg-gray-0 pb-6">
      <button
        aria-label="이전 단계로 돌아가기"
        className="flex size-11 items-center justify-center rounded-full p-2.5 hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300"
        type="button"
        onClick={() => router.push(previousHref)}
      >
        <ChevronLeft aria-hidden="true" className="size-6" />
      </button>

      <section className="flex flex-1 flex-col gap-1 px-5 pt-8">
        <h1 className="text-headline-h2-700 text-gray-900">
          선택하신 &lt;{category}&gt; 카테고리에 대해
          <br />몇 가지만 더 물어볼게요.
        </h1>
        <p className="text-body-b1-400 text-gray-700">
          자세한 미션 추천을 위한 질문으로,
          <br />
          초기 미션 생성에만 필요해요.
        </p>
      </section>

      <div className="px-5 pt-2">
        <ButtonGroup onNext={onNext} onPrev={() => router.push(previousHref)} />
      </div>
    </main>
  );
}
