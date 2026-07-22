import { BENEFIT_CATEGORIES } from "@/app/(tabs)/benefits/constants";
import type { BenefitCategory } from "@/app/(tabs)/benefits/types";

interface CategoryFilterProps {
  selected: BenefitCategory;
  onSelect: (category: BenefitCategory) => void;
}

/**
 * 카테고리 필터. `<a href>`로 실제 URL을 유지해 딥링크·JS 미동작 시에도 서버 필터로
 * 동작하고, 클릭은 가로채 브라우저에서 즉시 필터링한다.
 */
export function CategoryFilter({ selected, onSelect }: CategoryFilterProps) {
  return (
    <nav
      aria-label="혜택 카테고리"
      className="overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
    >
      <ul className="flex min-w-max gap-2">
        {BENEFIT_CATEGORIES.map((category) => {
          const isSelected = selected === category.value;
          return (
            <li key={category.value}>
              <a
                href={
                  category.value === "all" ? "/benefits" : `/benefits?category=${category.value}`
                }
                aria-current={isSelected ? "page" : undefined}
                onClick={(event) => {
                  // 좌클릭만 가로채 즉시 필터링. 새 탭·수식키 클릭은 브라우저 기본 동작에 맡긴다.
                  if (event.metaKey || event.ctrlKey || event.shiftKey || event.button !== 0)
                    return;
                  event.preventDefault();
                  onSelect(category.value);
                }}
                className={`inline-flex h-9 items-center whitespace-nowrap rounded-full border px-4 text-body-b2-500 ${
                  isSelected
                    ? "border-primary bg-blue-50 text-primary"
                    : "border-gray-200 bg-gray-0 text-gray-700"
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
