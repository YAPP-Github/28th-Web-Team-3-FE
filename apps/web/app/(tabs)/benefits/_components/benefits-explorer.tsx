"use client";

import { useEffect, useState } from "react";
import { BENEFITS } from "@/app/(tabs)/benefits/constants";
import { getBenefitCategoryHref } from "@/app/(tabs)/benefits/lib/category-href";
import { filterBenefits } from "@/app/(tabs)/benefits/lib/filter-benefits";
import {
  NO_SAVED_BENEFITS,
  readSavedBenefits,
  toggleSavedBenefit,
  writeSavedBenefits,
} from "@/app/(tabs)/benefits/lib/saved-benefits";
import type { BenefitCategory } from "@/app/(tabs)/benefits/types";
import { BenefitCard } from "./benefit-card";
import { CategoryFilter } from "./category-filter";

/**
 * 카테고리 필터 + 정책 목록. 데이터는 정적이라 서버에 다시 요청하지 않고
 * 브라우저에서 즉시 필터링한다. URL은 history.replaceState로만 동기화해(서버 재렌더 없음)
 * 공유·딥링크는 유지하되 전환은 끊김 없이 즉각 반영된다.
 * 초기 카테고리는 서버 페이지가 searchParams로 읽어 넘겨준다(딥링크 SSR·새로고침 유지).
 */
export function BenefitsExplorer({ initialCategory }: { initialCategory: BenefitCategory }) {
  const [category, setCategory] = useState(initialCategory);
  const [savedIds, setSavedIds] = useState(NO_SAVED_BENEFITS);
  const benefits = filterBenefits(BENEFITS, category);

  // localStorage는 서버에 없다. 첫 렌더는 저장 없음으로 그리고 마운트 후 실제 값으로 맞춘다.
  useEffect(() => {
    setSavedIds(readSavedBenefits());
  }, []);

  function selectCategory(next: BenefitCategory) {
    setCategory(next);
    window.history.replaceState(null, "", getBenefitCategoryHref(next));
  }

  function toggleSave(id: string) {
    // 저장은 updater 밖에서 한다 — StrictMode가 updater를 두 번 부르므로 안에 두면
    // 같은 값을 두 번 쓴다.
    const next = toggleSavedBenefit(savedIds, id);
    setSavedIds(next);
    writeSavedBenefits(next);
  }

  return (
    <>
      <h2 className="mt-[17px] px-5 text-title-t2-700 text-gray-900">맞춤 추천 혜택</h2>
      <div className="mt-[18px]">
        <CategoryFilter selected={category} onSelect={selectCategory} />
      </div>
      <section id="benefits-list" aria-label="정책 목록" className="mt-5 flex flex-col gap-3 px-5">
        {benefits.map((benefit) => (
          <BenefitCard
            key={benefit.id}
            benefit={benefit}
            saved={savedIds.has(benefit.id)}
            onToggleSave={toggleSave}
          />
        ))}
      </section>
    </>
  );
}
