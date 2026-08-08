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
  // history.length는 앱 밖 방문까지 세므로, App Router가 유지하는 진입 인덱스(idx)로 판단한다.
  function goBack() {
    const idx = (window.history.state as { idx?: number } | null)?.idx ?? 0;
    if (idx > 0) {
      router.back();
    } else {
      router.replace("/mypage");
    }
  }

  return (
    <div className="pb-10">
      <header className="flex h-11 items-center">
        <Button aria-label="뒤로가기" size="icon" variant="ghost" onClick={goBack}>
          <ChevronLeft className="size-6" strokeWidth={1.6} />
        </Button>
      </header>
      <div className="px-5">
        <h1 className="mt-2 text-headline-h2-700 text-gray-900">{title}</h1>
        <div className="mt-6 flex flex-col gap-6">{children}</div>
      </div>
    </div>
  );
}
