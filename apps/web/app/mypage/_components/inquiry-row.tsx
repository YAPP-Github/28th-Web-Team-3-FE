"use client";

import { useState } from "react";
import { InquirySheet } from "./inquiry-sheet";
import { SettingButtonRow } from "./setting-row";

/** 문의하기 행 — 바텀시트를 여는 상호작용만 담는 클라이언트 아일랜드. */
export function InquiryRow() {
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  return (
    <>
      <SettingButtonRow onClick={() => setIsSheetOpen(true)}>문의하기</SettingButtonRow>
      <InquirySheet open={isSheetOpen} onOpenChange={setIsSheetOpen} />
    </>
  );
}
