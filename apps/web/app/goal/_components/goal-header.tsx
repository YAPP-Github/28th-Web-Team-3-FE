"use client";

import { Button } from "@repo/ui";
import { ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";

/** 목표 상세 상단 헤더 — 뒤로가기 + 가운데 "목표" 타이틀. 우측은 대칭용 여백. */
export function GoalHeader() {
  const router = useRouter();

  // 앱 내 히스토리가 없을 때(딥링크·새로고침)는 홈으로 보낸다.
  function goBack() {
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push("/");
    }
  }

  return (
    <header className="grid h-11 grid-cols-[44px_1fr_44px] items-center pr-2.5 pl-2.5">
      <Button aria-label="뒤로가기" size="icon" variant="ghost" onClick={goBack}>
        <ChevronLeft className="size-6" strokeWidth={1.6} />
      </Button>
      <h1 className="text-center text-title-t1-700 text-gray-900">목표</h1>
      <span aria-hidden="true" />
    </header>
  );
}
