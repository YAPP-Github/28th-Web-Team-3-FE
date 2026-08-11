import { AppVersionRow } from "./_components/app-version-row";
import { InquiryRow } from "./_components/inquiry-row";
import { SettingLinkRow } from "./_components/setting-row";
import { WithdrawalButton } from "./_components/withdrawal-button";

export default function MyPage() {
  return (
    <div className="px-5 pt-2">
      <h1 className="text-title-t1-700 text-gray-900">마이페이지</h1>

      <ul className="mt-4">
        {/*
          문서는 탭 그룹 밖(`/legal`)에 둔다 — 스토어에 제출하는 개인정보처리방침 URL은
          브라우저에서 토큰 없이 열려야 하는데, 탭 그룹은 인증 가드 아래라 401로 막힌다.
        */}
        <li>
          <SettingLinkRow href="/legal/terms">이용약관</SettingLinkRow>
        </li>
        <li>
          <SettingLinkRow href="/legal/privacy">개인정보처리방침</SettingLinkRow>
        </li>
        <li>
          <InquiryRow />
        </li>
        <li>
          <WithdrawalButton />
        </li>
      </ul>

      <AppVersionRow />
    </div>
  );
}
