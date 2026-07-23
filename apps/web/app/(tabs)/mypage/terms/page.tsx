import { LegalDraftNotice, LegalSection } from "@/app/(tabs)/mypage/_components/legal-content";
import { LegalPageLayout } from "@/app/(tabs)/mypage/_components/legal-page-layout";

export default function TermsPage() {
  return (
    <LegalPageLayout title="이용약관">
      <LegalDraftNotice />

      <LegalSection heading="제1조 (목적)">
        <p>
          본 약관은 `[운영자명]`이 제공하는 `[서비스명]`의 이용 조건과 운영자 및 이용자의 권리와
          의무를 정하는 것을 목적으로 합니다.
        </p>
      </LegalSection>

      <LegalSection heading="제2조 (서비스 내용)">
        <p>
          서비스는 이용자가 입력한 재무 정보와 투자 성향을 바탕으로 관련 분석과 정보를 제공합니다.
        </p>
        <p>
          서비스에서 제공하는 내용은 참고용이며, 특정 금융상품의 매수·매도 권유, 투자자문 또는 수익
          보장을 의미하지 않습니다. 최종 투자 판단과 그에 따른 책임은 이용자에게 있습니다.
        </p>
      </LegalSection>

      <LegalSection heading="제3조 (서비스 이용)">
        <p>서비스는 별도 회원가입 없이 게스트 방식으로 제공됩니다.</p>
        <p>
          이용자는 허위 정보를 입력하거나, 타인의 정보를 도용하거나, 서비스의 정상적인 운영을
          방해해서는 안 됩니다.
        </p>
      </LegalSection>

      <LegalSection heading="제4조 (서비스 변경 및 중단)">
        <p>
          운영자는 서비스 개선, 점검, 장애 또는 운영상 필요한 경우 서비스의 일부 또는 전부를
          변경하거나 중단할 수 있습니다.
        </p>
      </LegalSection>

      <LegalSection heading="제5조 (지식재산권)">
        <p>
          서비스에 포함된 문구, 디자인, 이미지, 소프트웨어 등 콘텐츠의 권리는 운영자 또는 정당한
          권리자에게 있습니다. 이용자는 사전 동의 없이 이를 복제, 배포 또는 상업적으로 이용할 수
          없습니다.
        </p>
      </LegalSection>

      <LegalSection heading="제6조 (책임 제한)">
        <p>
          운영자는 이용자의 귀책사유, 기기 문제, 통신 장애 또는 운영자가 통제하기 어려운 사유로
          발생한 손해에 대해 책임을 지지 않습니다.
        </p>
        <p>다만 운영자의 고의 또는 중대한 과실로 발생한 손해에는 본 조항을 적용하지 않습니다.</p>
      </LegalSection>

      <LegalSection heading="제7조 (약관 변경)">
        <p>약관이 변경되는 경우 시행 전에 서비스 내에서 안내합니다.</p>
      </LegalSection>

      <LegalSection heading="제8조 (문의 및 분쟁)">
        <p>
          서비스 관련 문의는 마이페이지의 문의하기(카카오톡 오픈채팅)로 접수할 수 있습니다. 분쟁이
          발생하면 대한민국 법률을 적용하며, 관할법원은 민사소송법에 따릅니다.
        </p>
        <p>시행일: `[시행일]`</p>
      </LegalSection>
    </LegalPageLayout>
  );
}
