import BenefitCardWon from "@repo/ui/svg/benefit-card-won.svg";
import BenefitCoin from "@repo/ui/svg/benefit-coin.svg";
import Link from "next/link";
import { redirect } from "next/navigation";
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
 * 저장 목록이 칩에서 별도 화면으로 빠지기 전의 링크. 공유된 URL이 조용히 전체 목록으로
 * 떨어지지 않게 새 경로로 보낸다.
 */
export default async function BenefitsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string | string[] }>;
}) {
  const { category } = await searchParams;
  if (category === "saved") redirect("/benefits/saved");

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
            그 위에 얹히는 원화 마크·동전만 피그마에서 내보낸 SVG를 쓴다. */}
        <div className="mt-[22px] flex items-start justify-between gap-2">
          <p className="text-headline-h2-700 text-gray-900">
            지금 바로 신청하기
            <br />
            좋은 혜택
          </p>
          <div
            aria-hidden="true"
            className="relative h-[104px] w-[148px] shrink-0"
            data-slot="benefit-hero-illustration"
          >
            <span className="absolute top-[14px] left-[22px] h-[57px] w-[94px] rotate-[-6.64deg] rounded-md bg-blue-200" />
            <span className="absolute top-9 left-12 h-[57px] w-[93px] rotate-[6.88deg] rounded-md bg-blue-100" />
            <BenefitCardWon className="absolute top-14 left-[79px] h-[27px] w-[37px]" />
            <BenefitCoin className="absolute top-[39px] left-0 h-[38px] w-[30px] rotate-[11.54deg]" />
          </div>
        </div>
      </section>

      <Suspense fallback={<BenefitsExplorerSkeleton />}>
        <BenefitsExplorer />
      </Suspense>

      <p className="mt-6 px-5 text-center text-caption-c1-500 text-gray-400">
        정책 내용은 변동될 수 있어요. 공식 페이지 기준으로 확인해 주세요.
      </p>
    </main>
  );
}
