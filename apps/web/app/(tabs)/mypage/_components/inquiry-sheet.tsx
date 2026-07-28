import { bridge, isNativeApp } from "@repo/bridge";
import { BottomSheet, Button } from "@repo/ui";

interface InquirySheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * 문의하기 바텀시트 — 디자인 미확정 가안.
 * 카카오 오픈채팅으로 연결한다. WebView 안에서는 bridge.openExternal로 네이티브에 위임하고
 * (window.open·target="_blank"는 WebView에서 통하지 않는다), 일반 브라우저에서는 새 탭으로 연다.
 * URL은 NEXT_PUBLIC_KAKAO_OPENCHAT_URL 환경변수로 관리 — 없으면 버튼을 비활성화한다.
 */
export function InquirySheet({ open, onOpenChange }: InquirySheetProps) {
  const openChatUrl = process.env.NEXT_PUBLIC_KAKAO_OPENCHAT_URL;

  function openInquiryChannel() {
    if (!openChatUrl) return;
    if (isNativeApp()) {
      // 웹 브릿지는 throwOnError:true라 전송 실패(타임아웃·구버전 앱에 openExternal 미등록)
      // 시 reject된다 — 삼켜서 unhandled rejection을 막는다.
      bridge.openExternal(openChatUrl).catch(() => {});
    } else {
      window.open(openChatUrl, "_blank", "noopener,noreferrer");
    }
  }

  return (
    <BottomSheet open={open} title="문의하기" onOpenChange={onOpenChange}>
      <div className="flex flex-col gap-6 px-5 pt-4 pb-8">
        <p className="text-body-b1-400 text-gray-700">
          궁금한 점이나 불편한 점이 있으신가요?
          <br />
          카카오톡 오픈채팅으로 편하게 문의해주세요.
        </p>
        <Button size="cta" disabled={!openChatUrl} onClick={openInquiryChannel}>
          {openChatUrl ? "카카오톡으로 문의하기" : "준비 중이에요"}
        </Button>
      </div>
    </BottomSheet>
  );
}
