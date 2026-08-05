import { bridge, isNativeApp } from "@repo/bridge";
import { BottomSheet, Button } from "@repo/ui";
import { PRIVACY_CONTACT_EMAIL } from "./legal-content";

interface InquirySheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * 문의하기 바텀시트 — 디자인 미확정 가안.
 * 카카오 오픈채팅으로 연결한다. WebView 안에서는 bridge.openExternal로 네이티브에 위임하고
 * (window.open·target="_blank"는 WebView에서 통하지 않는다), 일반 브라우저에서는 새 탭으로 연다.
 *
 * 오픈채팅 URL(NEXT_PUBLIC_KAKAO_OPENCHAT_URL)이 없으면 이메일로 떨어진다 — 버튼을 막으면
 * 문의 수단이 아예 없는 앱이 되고, 심사에서는 그게 더 크게 걸린다(App Store 1.5).
 */
export function InquirySheet({ open, onOpenChange }: InquirySheetProps) {
  const openChatUrl = process.env.NEXT_PUBLIC_KAKAO_OPENCHAT_URL;
  const inquiryUrl = openChatUrl ?? `mailto:${PRIVACY_CONTACT_EMAIL}`;

  function openInquiryChannel() {
    if (isNativeApp()) {
      // 웹 브릿지는 throwOnError:true라 전송 실패(타임아웃·구버전 앱에 openExternal 미등록)
      // 시 reject된다 — 삼켜서 unhandled rejection을 막는다.
      bridge.openExternal(inquiryUrl).catch(() => {});
      return;
    }
    // mailto는 새 탭으로 열면 빈 탭이 남는다 — 현재 탭에서 메일 앱으로 넘긴다.
    if (openChatUrl) {
      window.open(openChatUrl, "_blank", "noopener,noreferrer");
    } else {
      window.location.href = inquiryUrl;
    }
  }

  return (
    <BottomSheet open={open} title="문의하기" onOpenChange={onOpenChange}>
      <div className="flex flex-col gap-6 px-5 pt-4 pb-8">
        <p className="text-body-b1-400 text-gray-700">
          궁금한 점이나 불편한 점이 있으신가요?
          <br />
          {openChatUrl
            ? "카카오톡 오픈채팅으로 편하게 문의해주세요."
            : "이메일로 편하게 문의해주세요."}
        </p>
        <Button size="cta" onClick={openInquiryChannel}>
          {openChatUrl ? "카카오톡으로 문의하기" : "이메일로 문의하기"}
        </Button>
      </div>
    </BottomSheet>
  );
}
