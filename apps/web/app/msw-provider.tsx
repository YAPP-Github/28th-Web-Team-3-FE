"use client";

import { useEffect } from "react";

export function MSWProvider() {
  useEffect(() => {
    import("../mocks/browser").then(({ worker }) => {
      worker.start({ onUnhandledRequest: "bypass" });
    });
  }, []);
  return null;
}
