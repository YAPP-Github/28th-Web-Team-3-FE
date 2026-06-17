"use client";

import { bridge, isNativeApp } from "@repo/bridge";
import { Button } from "@repo/ui";
import { useEffect, useState } from "react";

/**
 * Demonstrates the web -> native bridge. Renders only inside the WebView shell;
 * in a plain browser `isNativeApp()` is false and nothing shows (graceful degradation).
 */
export function NativeFeatures() {
  const [native, setNative] = useState(false);

  useEffect(() => {
    setNative(isNativeApp());
  }, []);

  if (!native) return null;

  return (
    <div className="flex flex-col gap-2 rounded-lg border p-4">
      <p className="font-medium text-sm">네이티브 기능</p>
      <div className="flex flex-wrap gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => bridge.share({ url: window.location.href, message: "공유합니다" })}
        >
          공유 시트
        </Button>
        <Button variant="outline" size="sm" onClick={() => bridge.authenticate("잠금 해제")}>
          생체인증
        </Button>
      </div>
    </div>
  );
}
