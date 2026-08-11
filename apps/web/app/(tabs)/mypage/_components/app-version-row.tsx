"use client";

import { bridge, isNativeApp } from "@repo/bridge";
import { useEffect, useState } from "react";

/**
 * 앱 버전 행. 값의 원본은 네이티브(`apps/native/app.config.ts`의 `expo.version`)이고
 * 브릿지로 받는다 — 웹 번들 버전을 보여주면 사용자가 스토어에서 받은 앱과 다른 숫자를 본다.
 *
 * 버전을 모를 때는 구분선까지 통째로 그리지 않는다. 네이티브 셸 밖(일반 브라우저)에는
 * 알려줄 버전이 없고, 빈 값이나 "-"를 남기면 앱이 버전을 잃은 것처럼 보인다.
 */
export function AppVersionRow() {
  const [version, setVersion] = useState<string>();

  useEffect(() => {
    if (!isNativeApp()) return;
    let isMounted = true;
    // 웹 브릿지는 throwOnError:true라 구버전 셸에서는 reject된다 — 버전만 못 보여줄 뿐이다.
    bridge.getNativeInfo().then(
      (info) => {
        if (isMounted) setVersion(info.appVersion);
      },
      () => {},
    );
    return () => {
      isMounted = false;
    };
  }, []);

  if (!version) return null;

  return (
    <>
      {/* 시안의 구분선은 화면 폭을 꽉 채운다 — 좌우 여백 밖으로 빼서 그린다. */}
      <hr className="-mx-5 my-4 border-gray-100" />
      <div className="flex h-11 items-center justify-between">
        <span className="text-body-b1-500 text-gray-900">버전 정보</span>
        <span className="text-body-b2-500 text-gray-400">{version}</span>
      </div>
    </>
  );
}
