"use client";

import { Button } from "@repo/ui";
import { ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";

interface LegalPageLayoutProps {
  title: string;
  children: ReactNode;
}

/** 약관·개인정보처리방침 등 인앱 문서 화면 — 뒤로가기 헤더 + 본문. */
export function LegalPageLayout({ title, children }: LegalPageLayoutProps) {
  const router = useRouter();

  // 딥링크·새로고침 등 앱 내 히스토리가 없을 때는 back()이 무의미하므로 마이페이지로 이동한다.
  function goBack() {
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push("/mypage");
    }
  }

  return (
    <div className="px-4 pt-1 pb-10">
      <header className="flex h-11 items-center">
        <Button aria-label="뒤로가기" size="icon" variant="ghost" onClick={goBack}>
          <ChevronLeft className="size-6" strokeWidth={1.6} />
        </Button>
      </header>
      <h1 className="mt-2 text-headline-h2-700 text-gray-900">{title}</h1>
      <div className="mt-6 flex flex-col gap-6">{children}</div>
    </div>
  );
}

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

/** 대괄호 항목·법무 검토가 남았음을 알리는 안내 배너. */
export function LegalDraftNotice() {
  return (
    <p className="rounded-[12px] bg-gray-50 px-4 py-3 text-body-b2-500 text-gray-500">
      ※ `[운영자명]`·`[서비스명]`·`[시행일]` 등 대괄호 항목은 확정 후 채워야 하며, 시행 전 법무
      검토가 필요합니다.
    </p>
  );
}
