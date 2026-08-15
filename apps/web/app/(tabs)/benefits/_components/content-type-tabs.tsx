"use client";

import { cn } from "@repo/ui";
import { BENEFIT_CONTENT_TYPES, type BenefitContentType } from "@/app/(tabs)/benefits/types";

interface ContentTypeTabsProps {
  selected: BenefitContentType;
  onSelect: (value: BenefitContentType) => void;
  className?: string;
  /** 패널을 잇는 id 접두사 — 한 화면에 두 벌이 뜨지 않으므로 기본값으로 충분하다. */
  idPrefix?: string;
}

/**
 * 정책 혜택 / 블로그 팁 상단 탭.
 *
 * 밑줄은 선택된 탭에만 그리고, 탭 줄 전체를 가로지르는 1px 선은 화면 폭을 채운다(디자인은
 * 탭 묶음이 335px, 아래 선은 375px). 그래서 선을 탭 컨테이너 안이 아니라 바깥에 둔다.
 *
 * `role="tab"`은 좌우 화살표 이동이 기본 동작이라 `onKeyDown`으로 직접 구현한다 — 탭이
 * 둘뿐이라 다음/이전이 곧 반대쪽이다.
 */
export function ContentTypeTabs({
  selected,
  onSelect,
  className,
  idPrefix = "benefit-content",
}: ContentTypeTabsProps) {
  function moveToOther() {
    const other = BENEFIT_CONTENT_TYPES.find(({ value }) => value !== selected);
    if (other) onSelect(other.value);
  }

  return (
    <div className={cn("border-gray-100 border-b", className)}>
      <div
        aria-label="혜택 종류"
        className="mx-auto flex w-[335px] max-w-full"
        role="tablist"
        onKeyDown={(event) => {
          if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
          event.preventDefault();
          moveToOther();
        }}
      >
        {BENEFIT_CONTENT_TYPES.map(({ value, label }) => {
          const isSelected = value === selected;
          return (
            <button
              aria-controls={`${idPrefix}-panel`}
              aria-selected={isSelected}
              className={`flex h-11 flex-1 items-center justify-center border-b-2 text-title-t2-700 transition-colors duration-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none ${
                isSelected
                  ? "border-gray-800 text-gray-800"
                  : "border-transparent text-gray-300 hover:text-gray-400"
              }`}
              id={`${idPrefix}-tab-${value}`}
              key={value}
              onClick={() => onSelect(value)}
              role="tab"
              // 선택된 탭만 Tab 키 순서에 남긴다 — 탭 목록은 화살표로 이동하는 게 표준이다.
              tabIndex={isSelected ? 0 : -1}
              type="button"
            >
              {label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
