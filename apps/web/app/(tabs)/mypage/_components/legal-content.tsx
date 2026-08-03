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

/** 서비스명 — 약관·방침 양쪽이 갈리지 않게 한 곳에서 정한다. */
export const SERVICE_NAME = "아끼모";

/**
 * 서비스를 운영하는 주체. 약관·방침이 갈리지 않게 한 곳에서 정한다.
 *
 * 개인정보 보호책임자 표기도 이 값을 쓴다. 개인정보 보호법 시행령 제31조는 보호책임자
 * "성명" 또는 "담당부서의 명칭과 연락처" 중 하나를 요구하므로 팀 명칭으로 갈음한다.
 */
export const OPERATOR_NAME = "아끼모 운영팀";

/**
 * 개인정보 관련 문의 창구. 시행령 제31조가 "전화번호 등 연락처"를 요구하는데
 * 오픈채팅만 두면 연락처로 인정되는지 다툴 여지가 있어 이메일을 함께 둔다.
 */
export const PRIVACY_CONTACT_EMAIL = "yappweb3@gmail.com";

/** 약관·방침 공통 시행일. 문서를 고치면 이 값도 함께 올린다. */
export const POLICY_EFFECTIVE_DATE = "2026년 8월 10일";
