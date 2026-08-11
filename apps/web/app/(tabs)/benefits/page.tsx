import { SAFE_AREA_HERO_ATTRIBUTE } from "@/lib/safe-area-bands";
import { BenefitsExplorer } from "./_components/benefits-explorer";
import { parseBenefitFilter } from "./lib/filter-benefits";

interface BenefitsPageProps {
  searchParams: Promise<{ category?: string | string[] }>;
}

export default async function BenefitsPage({ searchParams }: BenefitsPageProps) {
  const initialFilter = parseBenefitFilter((await searchParams).category);

  return (
    <main className="flex flex-1 flex-col bg-gray-0">
      {/* 히어로는 탭 제목까지 감싼다 — 디자인에서 파란 면이 상단 바 뒤까지 이어진다.
          표시는 safe-area 밴드가 스크롤을 따라가게 한다(`lib/safe-area-bands.ts`). */}
      <section {...{ [SAFE_AREA_HERO_ATTRIBUTE]: "" }} className="bg-blue-50 px-5 pb-[46px]">
        <h1 className="py-2 text-title-t1-700 text-gray-900">혜택</h1>
        <div className="mt-[22px] flex flex-col items-start gap-2">
          <p className="text-headline-h2-700 text-gray-900">
            지금 바로 신청할
            <br />수 있는 혜택
          </p>
          {/* 개수는 못 쓴다 — 목록이 페이지 단위로 오고 전체 개수를 주는 응답이 없다. */}
          <a href="#benefits-list" className="text-body-b2-500 text-gray-900 underline-offset-4">
            혜택 보러가기
          </a>
        </div>
      </section>

      <BenefitsExplorer initialFilter={initialFilter} />

      <p className="mt-6 px-5 text-center text-caption-c1-500 text-gray-400">
        정책 내용은 변동될 수 있어요. 공식 페이지 기준으로 확인해 주세요.
      </p>
    </main>
  );
}
