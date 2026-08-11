import { BENEFIT_FILTERS } from "@/app/(tabs)/benefits/constants";
import { getBenefitFilterHref } from "@/app/(tabs)/benefits/lib/filter-href";
import type { BenefitFilter } from "@/app/(tabs)/benefits/types";

interface BenefitFiltersProps {
  selected: BenefitFilter;
  onSelect: (filter: BenefitFilter) => void;
}

/**
 * 필터 칩. `<a href>`로 실제 URL을 유지해 딥링크·공유가 살아 있고, 클릭은 가로채 페이지를
 * 다시 그리지 않고 목록만 새로 조회한다. 목록은 게스트 토큰이 필요해 어느 칩이든 브라우저에서
 * 받아오므로(`benefits-explorer.tsx`), 딥링크로 들어와도 카드는 마운트 후에 채워진다.
 *
 * 좌우 여백은 스크롤 영역 밖이 아니라 안(`px-5`)에 둔다 — 밖에 두면 마지막 칩이
 * 여백 경계에서 잘린 채 멈춘다.
 */
export function BenefitFilters({ selected, onSelect }: BenefitFiltersProps) {
  return (
    <nav
      aria-label="혜택 필터"
      className="overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
    >
      <ul className="flex min-w-max gap-1.5 px-5">
        {BENEFIT_FILTERS.map((filter) => {
          const isSelected = selected === filter.value;
          return (
            <li key={filter.value}>
              <a
                href={getBenefitFilterHref(filter.value)}
                aria-current={isSelected ? "page" : undefined}
                onClick={(event) => {
                  // 좌클릭만 가로채 즉시 필터링. 새 탭·수식키 클릭은 브라우저 기본 동작에 맡긴다.
                  if (event.metaKey || event.ctrlKey || event.shiftKey || event.button !== 0)
                    return;
                  event.preventDefault();
                  onSelect(filter.value);
                }}
                className={`inline-flex items-center whitespace-nowrap rounded-lg px-4 py-1.5 text-body-b2-700 ${
                  isSelected ? "bg-gray-800 text-gray-0" : "bg-gray-50 text-gray-300"
                }`}
              >
                {filter.label}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
