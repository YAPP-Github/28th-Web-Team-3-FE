"use client";

import { isNativeApp } from "@repo/bridge";
import { Button } from "@repo/ui";
import { ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { type ReactNode, useEffect, useState } from "react";

interface LegalPageLayoutProps {
  title: string;
  children: ReactNode;
}

/**
 * 약관·개인정보처리방침 화면 — 뒤로가기 헤더 + 본문.
 *
 * 같은 주소가 앱 안에서도 열리고 브라우저에서도 열린다(스토어에 제출하는 URL). 헤더는 앱 안에서만
 * 보여준다 — 돌아갈 `/mypage`가 있는 건 앱 쪽뿐이고, 브라우저에는 브라우저 자신의 뒤로가기가 있다.
 *
 * `history.length`나 `history.state.idx`로는 판단할 수 없다. `idx`는 Next 16에서 사라졌고
 * `length`는 주소를 바로 열어도 초기 항목 때문에 1을 넘는다.
 *
 * 이 화면은 탭 그룹 밖이라 바텀 네비가 없다. `router.back()`은 히스토리가 없을 때 아무 일도
 * 하지 않아 빠져나갈 길이 사라지므로, 들어오는 문이 마이페이지 하나뿐인 점을 이용해 그쪽으로
 * 되돌린다. 서버에서는 셸 여부를 알 수 없어 마운트 뒤에 정하는데, 헤더 높이가 고정이라 자리가
 * 밀리지는 않는다.
 */
export function LegalPageLayout({ title, children }: LegalPageLayoutProps) {
  const router = useRouter();
  const [inNativeApp, setInNativeApp] = useState(false);

  useEffect(() => {
    setInNativeApp(isNativeApp());
  }, []);

  return (
    <div className="pb-10">
      <header className="flex h-11 items-center">
        {inNativeApp ? (
          <Button
            aria-label="뒤로가기"
            size="icon"
            variant="ghost"
            onClick={() => router.replace("/mypage")}
          >
            <ChevronLeft className="size-6" strokeWidth={1.6} />
          </Button>
        ) : null}
      </header>
      <div className="px-5">
        <h1 className="mt-2 text-headline-h2-700 text-gray-900">{title}</h1>
        <div className="mt-6 flex flex-col gap-6">{children}</div>
      </div>
    </div>
  );
}
