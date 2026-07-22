"use client";

import { useState } from "react";
import { BENEFITS } from "@/app/(tabs)/benefits/constants";
import { filterBenefits } from "@/app/(tabs)/benefits/lib/filter-benefits";
import type { BenefitCategory } from "@/app/(tabs)/benefits/types";
import { BenefitCard } from "./benefit-card";
import { CategoryFilter } from "./category-filter";

/**
 * 카테고리 필터 + 정책 목록. 데이터(15개)는 정적이라 서버에 다시 요청하지 않고
 * 브라우저에서 즉시 필터링한다. URL은 history.replaceState로만 동기화해(서버 재렌더 없음)
 * 공유·딥링크는 유지하되 전환은 끊김 없이 즉각 반영된다.
 * 초기 카테고리는 서버 페이지가 searchParams로 읽어 넘겨준다(딥링크 SSR·새로고침 유지).
 */
export function BenefitsExplorer({ initialCategory }: { initialCategory: BenefitCategory }) {
  const [category, setCategory] = useState(initialCategory);
  const benefits = filterBenefits(BENEFITS, category);

  function selectCategory(next: BenefitCategory) {
    setCategory(next);
    const url = next === "all" ? "/benefits" : `/benefits?category=${next}`;
    window.history.replaceState(null, "", url);
  }

  return (
    <>
      <CategoryFilter selected={category} onSelect={selectCategory} />
      <section aria-label="정책 목록" className="mt-5 flex flex-col gap-3">
        {benefits.map((benefit) => (
          <BenefitCard key={benefit.id} benefit={benefit} />
        ))}
      </section>
    </>
  );
}
