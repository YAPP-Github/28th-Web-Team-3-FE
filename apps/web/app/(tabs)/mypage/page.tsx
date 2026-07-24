import { InquiryRow } from "./_components/inquiry-row";
import { SettingLinkRow } from "./_components/setting-row";

export default function MyPage() {
  return (
    <div className="px-4 pt-2">
      <h1 className="text-title-t1-700 text-gray-900">마이페이지</h1>

      <section className="mt-4">
        <h2 className="text-body-b2-500 text-gray-400">설정</h2>
        <ul className="mt-2">
          <li>
            <SettingLinkRow href="/mypage/terms">이용약관</SettingLinkRow>
          </li>
          <li>
            <SettingLinkRow href="/mypage/privacy">개인정보처리방침</SettingLinkRow>
          </li>
          <li>
            <InquiryRow />
          </li>
        </ul>
      </section>
    </div>
  );
}
