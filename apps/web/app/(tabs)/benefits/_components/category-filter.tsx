import { BENEFIT_CATEGORIES } from "@/app/(tabs)/benefits/constants";
import { getBenefitCategoryHref } from "@/app/(tabs)/benefits/lib/category-href";
import type { BenefitCategory } from "@/app/(tabs)/benefits/types";

interface CategoryFilterProps {
  selected: BenefitCategory;
  onSelect: (category: BenefitCategory) => void;
}

/**
 * 카테고리 필터. `<a href>`로 실제 URL을 유지해 딥링크·JS 미동작 시에도 서버 필터로
 * 동작하고, 클릭은 가로채 브라우저에서 즉시 필터링한다.
 *
 * 좌우 여백은 스크롤 영역 밖이 아니라 안(`px-5`)에 둔다 — 밖에 두면 마지막 칩이
 * 여백 경계에서 잘린 채 멈춘다.
 */
export function CategoryFilter({ selected, onSelect }: CategoryFilterProps) {
  return (
    <nav
      aria-label="혜택 카테고리"
      className="overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
    >
      <ul className="flex min-w-max gap-1.5 px-5">
        {BENEFIT_CATEGORIES.map((category) => {
          const isSelected = selected === category.value;
          return (
            <li key={category.value}>
              <a
                href={getBenefitCategoryHref(category.value)}
                aria-current={isSelected ? "page" : undefined}
                onClick={(event) => {
                  // 좌클릭만 가로채 즉시 필터링. 새 탭·수식키 클릭은 브라우저 기본 동작에 맡긴다.
                  if (event.metaKey || event.ctrlKey || event.shiftKey || event.button !== 0)
                    return;
                  event.preventDefault();
                  onSelect(category.value);
                }}
                className={`inline-flex items-center whitespace-nowrap rounded-lg px-4 py-1.5 text-body-b2-700 ${
                  isSelected ? "bg-gray-800 text-gray-0" : "bg-gray-50 text-gray-300"
                }`}
              >
                {category.label}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
