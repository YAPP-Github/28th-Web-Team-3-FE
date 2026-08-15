"use client";

import { ChevronDown, Star } from "lucide-react";
import { useId, useState } from "react";
import { fetchPolicyDetail } from "@/api/policy";
import type { BenefitItem } from "@/app/(tabs)/benefits/types";
import { openExternalLink } from "@/lib/open-external";

interface BenefitCardProps {
  benefit: BenefitItem;
  onToggleSave: (benefit: BenefitItem) => void;
}

const NO_APPLY_URL = "신청 페이지가 등록되지 않은 혜택이에요.";
const OPEN_FAILED = "혜택 정보를 불러오지 못했어요. 잠시 후 다시 시도해 주세요.";

/**
 * 정책 카드 — 제목을 누르면 공식 신청 페이지로 나간다.
 *
 * 목록 응답에는 신청 링크가 없어(상세에만 있다) 누른 뒤에 조회한다. 그래서 `<a href>`가
 * 아니라 버튼이다 — 주소를 모르는 채로 href를 채울 수 없고, 빈 링크는 새 탭에서 빈 화면을
 * 연다. 대신 카드 전체를 덮어(`after:inset-0`) 어디를 눌러도 열리게 한다.
 *
 * 저장 버튼은 덮개 위(`z-10`)에 둔다 — 안 그러면 클릭이 덮개에 먹혀 링크만 열린다.
 */
export function BenefitCard({ benefit, onToggleSave }: BenefitCardProps) {
  const [error, setError] = useState<string>();
  const [isOpening, setIsOpening] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const descriptionId = useId();

  async function openApplyPage() {
    // 버튼을 disabled로 막지 않는다 — 누르는 순간 접근성 트리에서 빠져 키보드 초점이 날아간다.
    if (isOpening) return;
    setError(undefined);
    setIsOpening(true);
    try {
      const detail = await fetchPolicyDetail(benefit.id);
      // 재시도로 풀리는 실패가 아니라 데이터에 링크가 없는 것이다 — 문구를 나눈다.
      if (!detail.applyUrl) {
        setError(NO_APPLY_URL);
        return;
      }
      openExternalLink(detail.applyUrl);
    } catch {
      setError(OPEN_FAILED);
    } finally {
      setIsOpening(false);
    }
  }

  return (
    <article className="relative flex min-w-0 flex-col gap-1.5 rounded-xl bg-gray-10 p-3.5 transition-[scale] duration-100 has-[:active]:scale-[0.99] motion-reduce:transition-none motion-reduce:has-[:active]:scale-100">
      <div className="flex min-w-0 items-center justify-between gap-2">
        {benefit.categoryLabel ? (
          <span className="min-w-0 truncate rounded bg-blue-100 px-1.5 py-1 text-caption-c1-700 text-blue-600">
            {benefit.categoryLabel}
          </span>
        ) : (
          <span className="min-w-0" />
        )}
        <button
          type="button"
          aria-pressed={benefit.saved}
          aria-label={`${benefit.title} 저장`}
          onClick={() => onToggleSave(benefit)}
          className="-m-3 relative z-10 flex size-11 shrink-0 items-center justify-center rounded-full transition-[scale,background-color] duration-100 hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring active:scale-[0.92] motion-reduce:transition-none motion-reduce:active:scale-100"
        >
          <Star
            aria-hidden="true"
            className={benefit.saved ? "size-5 fill-success text-success" : "size-5 text-gray-300"}
          />
        </button>
      </div>
      <div className="flex min-w-0 flex-col gap-1">
        <button
          type="button"
          aria-busy={isOpening}
          onClick={openApplyPage}
          className="line-clamp-2 break-words rounded-sm text-left text-body-b1-700 text-gray-900 transition-colors after:absolute after:inset-0 hover:text-gray-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring active:text-gray-600 aria-busy:text-gray-500"
        >
          {benefit.title}
        </button>
        {/*
          설명은 접어 두고 화살표로 편다. 카드 전체가 신청 페이지로 나가는 링크라(제목 버튼의
          `after:inset-0` 덮개) 펼침 버튼도 별과 같이 덮개 위(`z-10`)에 둬야 클릭이 먹지 않는다.
        */}
        {benefit.description ? (
          <div className="flex min-w-0 items-start justify-between gap-3.5">
            <p
              className={`min-w-0 break-words text-body-b2-500 ${
                isExpanded ? "text-gray-600" : "line-clamp-1 text-gray-900"
              }`}
              id={descriptionId}
            >
              {benefit.description}
            </p>
            <button
              aria-controls={descriptionId}
              aria-expanded={isExpanded}
              aria-label={`${benefit.title} 설명 ${isExpanded ? "접기" : "펼치기"}`}
              className="-m-2.5 relative z-10 flex size-10 shrink-0 items-center justify-center rounded-full transition-[scale,background-color] duration-100 hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring active:scale-[0.92] motion-reduce:transition-none motion-reduce:active:scale-100"
              onClick={() => setIsExpanded((expanded) => !expanded)}
              type="button"
            >
              <ChevronDown
                aria-hidden="true"
                className={`size-5 text-gray-400 transition-transform duration-100 motion-reduce:transition-none ${
                  isExpanded ? "rotate-180" : ""
                }`}
              />
            </button>
          </div>
        ) : null}
        {error ? (
          <p aria-live="polite" className="text-caption-c1-500 text-error">
            {error}
          </p>
        ) : null}
      </div>
    </article>
  );
}
