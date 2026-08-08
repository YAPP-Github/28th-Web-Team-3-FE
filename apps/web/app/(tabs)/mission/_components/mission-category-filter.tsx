import { cn } from "@repo/ui";
import { MISSION_CATEGORIES, type MissionCategory } from "../constants/mission";

interface MissionCategoryFilterProps {
  activeCategory: MissionCategory;
  onChange: (category: MissionCategory) => void;
}

export function MissionCategoryFilter({ activeCategory, onChange }: MissionCategoryFilterProps) {
  return (
    <div aria-label="미션 카테고리" className="flex gap-1.5" role="tablist">
      {MISSION_CATEGORIES.map((category) => (
        <button
          key={category}
          aria-selected={activeCategory === category}
          className={cn(
            "rounded-lg px-4 py-[6px] text-body-b2-700 w-fit h-fit focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            activeCategory === category ? "bg-gray-800 text-gray-0" : "bg-gray-50 text-gray-400",
          )}
          role="tab"
          type="button"
          onClick={() => onChange(category)}
        >
          {category}
        </button>
      ))}
    </div>
  );
}
