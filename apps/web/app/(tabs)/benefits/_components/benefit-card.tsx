"use client";

import { Star } from "lucide-react";
import { useState } from "react";
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

  async function openApplyPage() {
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
    <article className="relative flex flex-col gap-1.5 rounded-xl bg-gray-10 p-3.5">
      <div className="flex items-center justify-between gap-2">
        {benefit.categoryLabel ? (
          <span className="inline-flex items-center rounded bg-blue-100 px-1.5 py-1 text-caption-c1-700 text-blue-600">
            {benefit.categoryLabel}
          </span>
        ) : (
          <span />
        )}
        <button
          type="button"
          aria-pressed={benefit.saved}
          aria-label={`${benefit.title} 저장`}
          onClick={() => onToggleSave(benefit)}
          className="-m-1 relative z-10 p-1"
        >
          <Star
            aria-hidden="true"
            className={benefit.saved ? "size-5 fill-primary text-primary" : "size-5 text-gray-300"}
          />
        </button>
      </div>
      <div className="flex flex-col gap-1">
        <button
          type="button"
          disabled={isOpening}
          onClick={openApplyPage}
          className="text-left text-body-b1-700 text-gray-900 after:absolute after:inset-0"
        >
          {benefit.title}
        </button>
        {benefit.description ? (
          <p className="text-body-b2-500 text-gray-900">{benefit.description}</p>
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
