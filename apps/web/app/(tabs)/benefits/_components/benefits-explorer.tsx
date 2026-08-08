"use client";

import { useEffect, useState } from "react";
import { BENEFITS } from "@/app/(tabs)/benefits/constants";
import { filterBenefits } from "@/app/(tabs)/benefits/lib/filter-benefits";
import { getBenefitFilterHref } from "@/app/(tabs)/benefits/lib/filter-href";
import {
  NO_SAVED_BENEFITS,
  readSavedBenefits,
  toggleSavedBenefit,
  writeSavedBenefits,
} from "@/app/(tabs)/benefits/lib/saved-benefits";
import type { BenefitFilter } from "@/app/(tabs)/benefits/types";
import { BenefitCard } from "./benefit-card";
import { BenefitFilters } from "./benefit-filters";

/**
 * 필터 칩 + 정책 목록. 데이터는 정적이라 서버에 다시 요청하지 않고
 * 브라우저에서 즉시 필터링한다. URL은 history.replaceState로만 동기화해(서버 재렌더 없음)
 * 공유·딥링크는 유지하되 전환은 끊김 없이 즉각 반영된다.
 * 초기 필터는 서버 페이지가 searchParams로 읽어 넘겨준다(딥링크 SSR·새로고침 유지).
 */
export function BenefitsExplorer({ initialFilter }: { initialFilter: BenefitFilter }) {
  const [filter, setFilter] = useState(initialFilter);
  // localStorage는 서버에 없다. null은 "아직 안 읽음"이다. 빈 Set으로 시작하면
  // `?category=saved`로 들어왔을 때 저장한 게 있어도 "없어요"를 먼저 그렸다가 목록으로
  // 뒤집힌다 — 사용자가 틀린 화면을 한 번 보게 된다.
  const [savedIds, setSavedIds] = useState<ReadonlySet<string> | null>(null);
  const benefits = filterBenefits(BENEFITS, filter, savedIds ?? NO_SAVED_BENEFITS);

  useEffect(() => {
    setSavedIds(readSavedBenefits());
  }, []);

  function selectFilter(next: BenefitFilter) {
    setFilter(next);
    window.history.replaceState(null, "", getBenefitFilterHref(next));
  }

  function toggleSave(id: string) {
    // 화면 상태가 아니라 저장소를 다시 읽고 토글한다. 버튼은 하이드레이션 직후부터 눌리는데
    // 이펙트는 페인트 뒤에 흘러서, 그 사이 클릭을 빈 Set으로 토글하면 방금 누른 id 하나만
    // 쓰여 기존 저장 목록이 통째로 지워진다. 저장소가 원본이므로 매번 거기서 시작한다.
    //
    // 저장은 updater 밖에서 한다 — StrictMode가 updater를 두 번 부르므로 안에 두면
    // 같은 값을 두 번 쓴다.
    const next = toggleSavedBenefit(readSavedBenefits(), id);
    setSavedIds(next);
    writeSavedBenefits(next);
  }

  // 저장 목록을 읽기 전에는 비었는지도, 몇 개인지도 말할 수 없다.
  const isResolved = filter !== "saved" || savedIds !== null;
  const isEmpty = isResolved && benefits.length === 0;

  return (
    <>
      <h2 className="mt-[17px] px-5 text-title-t2-700 text-gray-900">맞춤 추천 혜택</h2>
      <div className="mt-[18px]">
        <BenefitFilters selected={filter} onSelect={selectFilter} />
      </div>
      {/*
        칩을 눌러도 초점은 칩에 남으므로 결과가 바뀐 것을 따로 알린다. 목록 자체를 live
        region으로 만들면 안 된다 — 카드가 빠지기만 하는 변경은 안 읽히고, 카테고리를 바꾸면
        추가된 카드의 제목·설명·버튼이 통째로 읽히며, 별 버튼의 aria-pressed 변화까지
        region 안에서 일어난다. 짧은 상태 문구만 따로 둔다(W3C ARIA22).
      */}
      <p role="status" className="sr-only">
        {isResolved
          ? benefits.length > 0
            ? `혜택 ${benefits.length}개를 찾았어요.`
            : "조건에 맞는 혜택이 없어요."
          : ""}
      </p>
      <section id="benefits-list" aria-label="정책 목록" className="mt-5 flex flex-col gap-3 px-5">
        {isEmpty ? (
          <p className="py-10 text-center text-body-b2-500 text-gray-500">
            {filter === "saved" ? (
              <>
                저장한 혜택이 없어요.
                <br />
                관심 있는 혜택의 별을 눌러 저장해보세요.
              </>
            ) : (
              "해당하는 혜택이 없어요."
            )}
          </p>
        ) : (
          benefits.map((benefit) => (
            <BenefitCard
              key={benefit.id}
              benefit={benefit}
              saved={savedIds?.has(benefit.id) ?? false}
              onToggleSave={toggleSave}
            />
          ))
        )}
      </section>
    </>
  );
}
