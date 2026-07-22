"use client";

import { bridge, isNativeApp } from "@repo/bridge";
import { ExternalLink } from "lucide-react";
import type { MouseEvent } from "react";

/**
 * 공식 페이지 이동 링크. 일반 브라우저는 새 탭, WebView 안에서는 브릿지로 네이티브에 위임한다
 * (window.open·target="_blank"가 WebView에서 통하지 않기 때문).
 */
export function OfficialLink({ href, label }: { href: string; label: string }) {
  function handleClick(event: MouseEvent<HTMLAnchorElement>) {
    if (!isNativeApp()) return;
    event.preventDefault();
    // 웹 브릿지는 throwOnError:true라 실패 시 reject된다 — 삼켜서 unhandled rejection을 막는다.
    bridge.openExternal(href).catch(() => {});
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer noopener"
      onClick={handleClick}
      className="inline-flex min-h-10 items-center gap-1 text-body-b2-500 text-primary"
    >
      {label}
      <ExternalLink aria-hidden="true" className="size-4" />
    </a>
  );
}
