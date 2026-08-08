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

/**
 * 각 호를 번호로 세는 목록. 조문이 "제11조 제1항 제3호"처럼 서로를 번호로 참조하므로
 * 불릿(`LegalList`)으로 바꾸면 인용이 가리키는 곳을 찾을 수 없다.
 */
export function LegalOrderedList({ items }: { items: string[] }) {
  return (
    <ol className="flex list-decimal flex-col gap-1 pl-5">
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ol>
  );
}

// 공유 문자열은 `legal-constants.ts`에 있다 — 클라이언트 컴포넌트도 연락처를 쓰는데,
// 이 파일을 끌어오면 서버 컴포넌트로 남긴다는 위 전제가 깨진다.
