import {
  LegalList,
  LegalSection,
  POLICY_EFFECTIVE_DATE,
  SERVICE_NAME,
} from "@/app/(tabs)/mypage/_components/legal-content";
import { LegalPageLayout } from "@/app/(tabs)/mypage/_components/legal-page-layout";

export default function PrivacyPage() {
  return (
    <LegalPageLayout title="개인정보처리방침">
      <LegalSection heading="개요">
        <p>{SERVICE_NAME}는 이용자의 개인정보를 중요하게 생각하며 관련 법령을 준수합니다.</p>
      </LegalSection>

      <LegalSection heading="1. 처리하는 개인정보">
        <p>서비스는 다음 정보를 처리할 수 있습니다.</p>
        <LegalList
          items={[
            "게스트 식별을 위해 기기에서 생성한 임의 UUID",
            "서비스 인증을 위한 액세스 토큰과 리프레시 토큰",
            "연령대, 소득, 저축액, 자산 규모, 투자 경험 및 투자 성향 설문 응답",
            "접속 일시, IP 주소, 브라우저·운영체제·기기 정보, 오류 및 이용 기록",
            "이용자가 문의 과정에서 직접 제공한 정보",
          ]}
        />
        <p>
          주민등록번호, 실제 생체정보, 얼굴 또는 지문 데이터는 수집하지 않습니다. 생체인증은 기기
          운영체제에서 처리되며 서비스는 인증 성공 여부만 확인합니다.
        </p>
      </LegalSection>

      <LegalSection heading="2. 개인정보 이용 목적">
        <p>개인정보는 다음 목적으로 이용합니다.</p>
        <LegalList
          items={[
            "게스트 이용자 식별 및 서비스 상태 유지",
            "투자 성향 분석과 결과 제공",
            "오류 분석, 보안 유지 및 서비스 개선",
            "이용자 문의 처리",
          ]}
        />
      </LegalSection>

      <LegalSection heading="3. 보유기간">
        <p>
          투자 성향 설문 응답은 분석 결과 제공을 위해 처리하며, 서버에 저장하는 경우 서비스 제공에
          필요한 기간 동안 보관합니다.
        </p>
        <p>
          게스트 식별정보와 서비스 이용 기록은 이용자의 삭제 요청 또는 처리 목적 달성 시 지체 없이
          삭제합니다. 관계 법령에 따라 보관이 필요한 정보는 해당 법령이 정한 기간 동안 보관합니다.
        </p>
      </LegalSection>

      <LegalSection heading="4. 외부 서비스 이용">
        <p>서비스는 운영, 오류 분석, 이용 통계를 위해 다음 외부 서비스를 이용합니다.</p>
        <LegalList
          items={[
            "Vercel — 서비스 배포 및 운영 (접속 정보, 기기 정보)",
            "Sentry — 오류 수집 및 성능 분석 (오류 기록, 접속 정보, 기기 정보, 화면 조작 기록)",
            "Mixpanel — 서비스 이용 통계 분석 (화면 이동 기록, 접속 정보, 기기 정보, 화면 조작 기록)",
          ]}
        />
        <p>
          Sentry와 Mixpanel은 오류 원인 파악과 서비스 개선을 위해 이용자의 화면 조작 기록(세션
          리플레이)을 수집합니다. 이때 입력한 값과 화면에 표시된 문자는 자동으로 가려진 상태로
          기록됩니다.
        </p>
        <p>
          운영자는 인증 토큰과 설문 입력값이 오류 기록과 화면 조작 기록에 포함되지 않도록 필요한
          보호조치를 적용합니다.
        </p>
      </LegalSection>

      <LegalSection heading="5. 제3자 제공">
        <p>
          운영자는 이용자의 개인정보를 제3자에게 판매하거나 임의로 제공하지 않습니다. 이용자의
          동의가 있거나 법령에 따른 요청이 있는 경우에만 제공합니다.
        </p>
      </LegalSection>

      <LegalSection heading="6. 개인정보 삭제 및 이용자 권리">
        <p>이용자는 자신의 개인정보에 대한 열람, 수정, 삭제 또는 처리 중단을 요청할 수 있습니다.</p>
        <p>
          요청은 마이페이지의 문의하기(카카오톡 오픈채팅)로 접수하며, 운영자는 확인 후 지체 없이
          처리합니다.
        </p>
      </LegalSection>

      <LegalSection heading="7. 만 14세 미만 이용자">
        <p>
          서비스는 만 14세 미만 이용자를 대상으로 하지 않습니다. 만 14세 미만 이용자의 개인정보가
          확인되면 지체 없이 삭제합니다.
        </p>
      </LegalSection>

      <LegalSection heading="8. 개인정보 보호조치">
        <p>
          운영자는 개인정보 보호를 위해 전송구간 암호화, 접근권한 제한, 기기 보안 저장소 사용 등
          필요한 조치를 시행합니다.
        </p>
      </LegalSection>

      <LegalSection heading="9. 방침 변경">
        <p>개인정보처리방침이 변경되는 경우 시행 전에 서비스 내에서 안내합니다.</p>
        <p>
          운영자: {SERVICE_NAME} · 문의: 마이페이지 문의하기 · 시행일: {POLICY_EFFECTIVE_DATE}
        </p>
      </LegalSection>
    </LegalPageLayout>
  );
}
