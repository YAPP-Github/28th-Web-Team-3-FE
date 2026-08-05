import { bridge, isNativeApp } from "@repo/bridge";
import { BottomSheet, Button } from "@repo/ui";
import { PRIVACY_CONTACT_EMAIL } from "./legal-constants";

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
  // 빈 문자열도 "설정 안 함"으로 본다 — 배포 환경은 변수를 비운 채 정의해두는 경우가 흔한데,
  // `??`로만 받으면 빈 URL을 그대로 열어 아무 일도 일어나지 않는다.
  const openChatUrl = process.env.NEXT_PUBLIC_KAKAO_OPENCHAT_URL || undefined;
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
            : "아래 주소로 편하게 문의해주세요."}
        </p>
        {/*
          openExternal은 실패해도 던지지 않고 false만 돌려준다 — 메일 앱이 지워진 기기에서는
          버튼을 눌러도 아무 일이 없다. 유일한 문의 수단이므로 주소를 본문에도 남겨
          링크가 안 열려도 눈으로 보고 옮겨 적을 수 있게 한다.
        */}
        {openChatUrl ? null : (
          <p className="text-body-b1-700 text-gray-900">{PRIVACY_CONTACT_EMAIL}</p>
        )}
        <Button size="cta" onClick={openInquiryChannel}>
          {openChatUrl ? "카카오톡으로 문의하기" : "이메일로 문의하기"}
        </Button>
      </div>
    </BottomSheet>
  );
}
