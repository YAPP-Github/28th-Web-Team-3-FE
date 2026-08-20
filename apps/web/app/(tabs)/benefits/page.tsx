import BenefitCardWon from "@repo/ui/svg/benefit-card-won.svg";
import BenefitCoin from "@repo/ui/svg/benefit-coin.svg";
import Link from "next/link";
import { Suspense } from "react";
import { SAFE_AREA_HERO_ATTRIBUTE } from "@/lib/safe-area-bands";
import { BenefitsExplorer } from "./_components/benefits-explorer";

const FILTER_SKELETONS = ["all", "finance", "housing", "welfare", "education"];
const CARD_SKELETONS = ["first", "second", "third"];

function BenefitsExplorerSkeleton() {
  return (
    <section aria-busy="true" aria-label="혜택 목록">
      <span role="status" className="sr-only">
        혜택 목록을 불러오고 있어요.
      </span>
      <div className="border-gray-100 border-b pt-2.5">
        <div className="mx-auto flex h-11 w-[335px] max-w-full">
          <div className="flex-1 border-gray-800 border-b-2" />
          <div className="flex-1" />
        </div>
      </div>
      <div className="mt-[23px] flex gap-1.5 overflow-hidden px-5">
        {FILTER_SKELETONS.map((filter) => (
          <div
            key={filter}
            className="h-9 w-16 shrink-0 animate-pulse rounded-lg bg-gray-50 motion-reduce:animate-none"
          />
        ))}
      </div>
      <div className="mt-5 flex flex-col gap-3 px-5">
        {CARD_SKELETONS.map((card) => (
          <div
            key={card}
            className="h-28 animate-pulse rounded-xl bg-gray-50 motion-reduce:animate-none"
          />
        ))}
      </div>
    </section>
  );
}

/**
 * `searchParams`를 여기서 읽지 않는다 — 읽는 순간 이 라우트가 동적 렌더로 바뀌어 탭을
 * 누를 때마다 서버 왕복을 기다린다. 필터는 클라이언트(`BenefitsExplorer`)가 읽고, 옛
 * `?category=saved` 링크는 `next.config.ts`의 redirects가 처리한다.
 */
export default function BenefitsPage() {
  return (
    <main className="flex flex-1 flex-col overflow-x-clip bg-gray-0">
      {/* 히어로는 탭 제목까지 감싼다 — 디자인에서 파란 면이 상단 바 뒤까지 이어진다.
          표시는 safe-area 밴드가 스크롤을 따라가게 한다(`lib/safe-area-bands.ts`). */}
      <section {...{ [SAFE_AREA_HERO_ATTRIBUTE]: "" }} className="bg-blue-50 px-5 pb-[39px]">
        <div className="flex items-center justify-between gap-2 py-2">
          <h1 className="text-title-t1-700 text-gray-900">혜택/팁</h1>
          <Link
            className="-mr-2.5 flex h-11 items-center rounded-sm px-2.5 text-body-b1-500 text-gray-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            href="/benefits/saved"
          >
            저장됨
          </Link>
        </div>
        {/* 문구 옆 일러스트는 카드 두 장이 겹친 모양이다. 회전한 사각형 두 개는 CSS로 그리고,
            그 위에 얹히는 원화 마크·동전만 피그마에서 내보낸 SVG를 쓴다.

            좁은 화면에서는 일러스트가 줄고 문구가 자리를 지킨다. 반대로 두면(문구가 줄고
            일러스트가 고정) 화면 폭이 375보다 좁을 때 "신청하기"가 단어 중간에서 끊긴다 —
            Z Flip 4(360px)에서 두 줄이어야 할 문구가 세 줄로 깨졌다. 일러스트는 비율만
            지키면 조금 작아져도 뜻이 상하지 않으므로 이쪽이 줄어드는 편이 낫다. */}
        <div className="mt-[22px] flex items-start justify-between gap-2">
          <p className="shrink-0 text-headline-h2-700 text-gray-900">
            지금 바로 신청하기
            <br />
            좋은 혜택
          </p>
          {/* 줄어들 수 있으므로 안쪽 좌표는 px가 아니라 컨테이너(148×104) 대비 비율이다 —
              px로 두면 상자만 줄고 내용은 그대로라 잘린다. */}
          <div
            aria-hidden="true"
            className="relative aspect-[37/26] w-[148px] min-w-0"
            data-slot="benefit-hero-illustration"
          >
            <span className="absolute top-[13.462%] left-[14.865%] h-[54.808%] w-[63.514%] rotate-[-6.64deg] rounded-md bg-blue-200" />
            <span className="absolute top-[34.615%] left-[32.432%] h-[54.808%] w-[62.838%] rotate-[6.88deg] rounded-md bg-blue-100" />
            <BenefitCardWon className="absolute top-[53.846%] left-[53.378%] h-[25.962%] w-[25%]" />
            <BenefitCoin className="absolute top-[37.5%] left-0 h-[36.538%] w-[20.27%] rotate-[11.54deg]" />
          </div>
        </div>
      </section>

      <Suspense fallback={<BenefitsExplorerSkeleton />}>
        <BenefitsExplorer />
      </Suspense>
    </main>
  );
}
