import { BottomSheet, Button } from "@repo/ui";
import { PRIVACY_CONTACT_EMAIL } from "@/lib/legal";
import { openExternalLink } from "@/lib/open-external";

interface InquirySheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const OPEN_CHAT_HOSTNAME = "open.kakao.com";

/**
 * 카카오 오픈채팅으로 열 수 있는 주소일 때만 돌려준다.
 *
 * 배포 환경은 변수를 비운 채 정의해두는 경우가 흔하고, `"https://"`처럼 호스트가 없는 값도
 * 들어올 수 있다. 그런 값을 "설정됨"으로 보면 이메일 주소를 감춘 채 눌러도 아무 일 없는
 * 오픈채팅 버튼만 남는다 — 이 컴포넌트가 없애려던 상태 그대로다.
 *
 * 호스트까지 보는 이유는 다르다. 엉뚱한 https 주소가 들어오면 버튼은 열리긴 하되 "카카오톡으로
 * 문의하기"라고 해놓고 무관한 사이트를 띄운다. 그럴 바엔 이메일로 떨어지는 편이 낫다.
 * 경로는 검사하지 않는다 — 오픈채팅 링크 형태가 여러 가지라 좁게 잡으면 멀쩡한 주소를 막는다.
 */
function resolveOpenChatUrl(raw: string | undefined): string | undefined {
  const value = raw?.trim();
  if (!value) return undefined;
  try {
    const url = new URL(value);
    return url.protocol === "https:" && url.hostname === OPEN_CHAT_HOSTNAME ? value : undefined;
  } catch {
    return undefined;
  }
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
  const openChatUrl = resolveOpenChatUrl(process.env.NEXT_PUBLIC_KAKAO_OPENCHAT_URL);
  const inquiryUrl = openChatUrl ?? `mailto:${PRIVACY_CONTACT_EMAIL}`;

  function openInquiryChannel() {
    openExternalLink(inquiryUrl);
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
          이메일로 떨어진 경우에만 주소를 보여준다. `openExternal`은 실패해도 false만 돌려주므로
          메일 앱이 없는 기기에서는 버튼이 무반응인데, 그때 옮겨 적을 곳이 화면에 있어야 한다.
          오픈채팅이 설정된 경로에서는 문의 창구가 카카오톡 하나라 주소를 함께 두지 않는다.
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
