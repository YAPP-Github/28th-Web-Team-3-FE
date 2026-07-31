import type { ReactNode } from "react";

/**
 * 약관·개인정보처리방침 본문 조각들. 순수 표현 컴포넌트라 서버 컴포넌트로 남긴다 —
 * 뒤로가기 헤더가 필요한 `LegalPageLayout`만 클라이언트 컴포넌트다.
 */

/** 문서 한 절 — 소제목 + 본문. 본문은 `<p>`·`<ul>` 등을 자유롭게 넣는다. */
export function LegalSection({ heading, children }: { heading: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-2 text-body-b2-400 text-gray-700">
      <h2 className="text-title-t2-700 text-gray-900">{heading}</h2>
      {children}
    </section>
  );
}

/** 문서 본문 불릿 목록. */
export function LegalList({ items }: { items: string[] }) {
  return (
    <ul className="flex list-disc flex-col gap-1 pl-5">
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  );
}

/** 서비스명 — 약관·방침 양쪽이 갈리지 않게 한 곳에서 정한다. */
export const SERVICE_NAME = "아끼모";

/** 약관·방침 공통 시행일. 문서를 고치면 이 값도 함께 올린다. */
export const POLICY_EFFECTIVE_DATE = "2026년 7월 31일";
