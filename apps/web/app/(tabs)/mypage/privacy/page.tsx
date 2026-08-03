import {
  LegalList,
  LegalOrderedList,
  LegalSection,
  OPERATOR_NAME,
  POLICY_EFFECTIVE_DATE,
  PRIVACY_CONTACT_EMAIL,
  SERVICE_NAME,
} from "@/app/(tabs)/mypage/_components/legal-content";
import { LegalPageLayout } from "@/app/(tabs)/mypage/_components/legal-page-layout";

export default function PrivacyPage() {
  return (
    <LegalPageLayout title="개인정보처리방침">
      <LegalSection heading="개요">
        <p>
          {OPERATOR_NAME}(이하 &lsquo;운영팀&rsquo;이라 한다)은 이용자의 개인정보를 소중히 다루며,
          관련 법령을 준수하고 개인정보 보호와 관련한 고충을 신속하고 원활하게 처리하기 위해 다음과
          같이 개인정보처리방침을 수립·공개합니다.
        </p>
      </LegalSection>

      <LegalSection heading="제1조 (개인정보의 처리 목적)">
        <p>
          운영팀은 다음의 목적을 위하여 개인정보를 처리하며, 처리하고 있는 개인정보는 다음의 목적
          이외의 용도로는 이용되지 않습니다. 이용 목적이 변경되는 경우에는 관련 법령에 따라 필요한
          조치를 이행합니다.
        </p>
        <LegalOrderedList
          items={[
            "게스트 식별 및 로그인 상태 유지",
            "사용자 재무상태 분석 및 그 결과(목표 금액, 맞춤 미션 등) 제공",
            "AI 기반 맞춤 미션 추천 생성",
            "오류 분석 및 서비스 품질 개선",
            "문의 및 불만 처리",
          ]}
        />
      </LegalSection>

      <LegalSection heading="제2조 (수집하는 개인정보 항목)">
        <p>운영팀은 다음의 개인정보 항목을 처리합니다.</p>
        <LegalOrderedList
          items={[
            "기기 생성 임의 UUID (게스트 식별용)",
            "인증 토큰",
            "생년월일",
            "재무상태 관련 응답: 월 소득, 월 저축액, 순자산, 목표 금액, 목표 기간 (식비, 교통, 생활, 취미 등 미션 추천에 사용되는 질문에 대한 응답 포함)",
            "접속 기록, 기기 정보, 오류(에러) 기록",
            "문의 시 이용자가 제공한 정보",
          ]}
        />
        <p>운영팀은 다음의 정보는 수집하지 않습니다.</p>
        <LegalList
          items={[
            "주민등록번호",
            "이름, 주소, 전화번호 등 이용자를 직접 식별할 수 있는 정보",
            "실제 생체·얼굴·지문 데이터 (생체인증은 이용자의 기기 운영체제(OS) 단에서 자체 처리되며, 운영팀은 해당 정보에 접근하거나 수집하지 않습니다)",
          ]}
        />
      </LegalSection>

      <LegalSection heading="제3조 (개인정보의 수집 방법)">
        <p>운영팀은 다음과 같은 방법으로 개인정보를 수집합니다.</p>
        <LegalOrderedList
          items={[
            "앱 내 온보딩 및 서비스 이용 과정에서 이용자가 직접 입력",
            "앱 이용 과정에서 자동으로 생성되어 수집 (기기 정보, 접속 기록, 오류 기록 등)",
          ]}
        />
      </LegalSection>

      <LegalSection heading="제4조 (개인정보의 보유 및 이용 기간)">
        <LegalOrderedList
          items={[
            "설문(재무상태 응답 등) 정보: 서비스 제공에 필요한 기간 동안 보관합니다.",
            "식별 정보 및 이용 기록: 이용 목적 달성 또는 이용자의 삭제 요청 시 지체 없이 파기합니다. 단, 관계 법령에 따라 보존 의무가 있는 경우에는 해당 기간 동안 보관합니다.",
          ]}
        />
      </LegalSection>

      <LegalSection heading="제5조 (개인정보의 파기절차 및 방법)">
        <LegalOrderedList
          items={[
            "운영팀은 개인정보 보유기간의 경과, 처리목적 달성 등 개인정보가 불필요하게 되었을 때에는 지체 없이 해당 개인정보를 파기합니다.",
            "전자적 파일 형태로 저장된 개인정보는 기록을 재생할 수 없는 기술적 방법으로 삭제합니다.",
          ]}
        />
      </LegalSection>

      <LegalSection heading="제6조 (AI를 활용한 미션 추천 및 자동화된 처리)">
        <LegalOrderedList
          items={[
            "운영팀은 이용자가 입력한 재무상태 응답(생년월일, 소득, 자산 등)을 외부 AI 언어모델 API(이하 'AI API 제공업체')에 전달하여 맞춤 미션 추천을 생성합니다.",
            "AI API 제공업체에 전달되는 정보는 미션 추천 생성이라는 단일 목적을 위해서만 처리되며, 운영팀은 자체 AI 모델을 별도로 학습(파인튜닝 등)시키지 않습니다.",
            "AI API 제공업체는 계약 및 약관에 따라 전달받은 정보를 자신의 모델 학습에 사용하지 않는 것을 원칙으로 하며, 관련 정책은 각 제공업체의 개인정보처리방침을 따릅니다.",
            "미션 추천은 이용자의 서비스 이용 편의를 위한 참고 정보 제공에 해당하며, 이용자의 권리나 의무에 법적 효과를 발생시키는 자동화된 결정에는 해당하지 않습니다. 다만 이용자는 추천된 미션을 언제든지 수정·삭제하거나 직접 새로운 미션을 추가할 수 있습니다.",
          ]}
        />
      </LegalSection>

      <LegalSection heading="제7조 (개인정보의 국외 이전)">
        <p>
          운영팀은 제6조에 따른 AI 미션 추천 생성을 위해 아래와 같이 개인정보를 국외로 이전합니다.
        </p>
        <LegalList
          items={[
            "제공받는 자: AI API 제공업체 (미국 소재)",
            "이전 항목: 재무상태 관련 응답(생년월일, 소득, 자산 등 미션 추천에 필요한 최소한의 정보)",
            "이전 목적: AI 기반 맞춤 미션 추천 생성",
            "이전 방법: 서비스 이용 시점에 API를 통한 네트워크 전송",
            "보유 및 이용기간: 각 AI API 제공업체의 정책에 따름 (원칙적으로 응답 생성 목적 달성 후 지체 없이 처리 종료)",
          ]}
        />
        <p>
          이전되는 개인정보 항목, 제공받는 자, 이전 국가 등은 AI API 제공업체 변경 시 지체 없이 본
          방침을 통해 갱신합니다.
        </p>
      </LegalSection>

      <LegalSection heading="제8조 (외부 솔루션 연동 및 처리위탁 현황)">
        <p>
          운영팀은 서비스 운영 및 품질 개선을 위하여 다음과 같은 외부 솔루션을 이용하고 있습니다.
        </p>
        <LegalOrderedList
          items={[
            "Vercel: 앱/서비스 배포 및 운영",
            "Sentry: 오류 및 성능 분석",
            "Mixpanel: 서비스 이용 통계 분석",
          ]}
        />
        <p>
          Sentry, Mixpanel을 통해 세션 리플레이(화면 조작 기록)가 수집될 수 있으나, 이용자가 입력한
          값과 텍스트는 자동으로 마스킹(가림) 처리되어 수집됩니다.
        </p>
        <p>
          향후 위탁업체 또는 위탁업무 내용이 추가·변경될 경우 본 방침을 통해 지체 없이 공개합니다.
        </p>
      </LegalSection>

      <LegalSection heading="제9조 (개인정보의 제3자 제공)">
        <p>
          운영팀은 이용자의 개인정보를 원칙적으로 외부에 제공하지 않습니다. 다만 이용자의 동의가
          있거나 법령에 특별한 규정이 있는 경우에는 예외로 하며, 제6조·제7조에 따른 AI API
          제공업체로의 처리 위탁은 본 조의 제3자 제공과 별개로 제6조·제7조를 따릅니다.
        </p>
      </LegalSection>

      <LegalSection heading="제10조 (정보주체의 권리·의무 및 행사방법)">
        <LegalOrderedList
          items={[
            "이용자는 언제든지 자신의 개인정보에 대한 열람, 정정, 삭제를 요청할 수 있습니다.",
            `권리 행사는 앱 내 마이페이지의 '문의하기(카카오톡 오픈채팅)' 또는 ${PRIVACY_CONTACT_EMAIL}로 요청하실 수 있으며, 운영팀은 요청 확인 후 지체 없이 필요한 조치를 취합니다.`,
          ]}
        />
      </LegalSection>

      <LegalSection heading="제11조 (만 14세 미만 아동의 개인정보 처리 제한)">
        <p>
          운영팀의 서비스는 만 14세 미만 아동은 이용하실 수 없습니다. 만 14세 미만 아동의 개인정보가
          수집된 사실이 확인될 경우, 운영팀은 해당 정보를 지체 없이 삭제합니다.
        </p>
      </LegalSection>

      <LegalSection heading="제12조 (개인정보의 안전성 확보조치)">
        <p>운영팀은 개인정보 보호를 위하여 다음과 같은 기술적·관리적 조치를 취하고 있습니다.</p>
        <LegalOrderedList
          items={[
            "전송구간 암호화: 이용자의 개인정보는 암호화된 통신 구간을 통해 전송됩니다.",
            "기기 보안 저장소 활용: 인증 토큰 등 주요 정보는 기기 내 보안 저장소에 안전하게 보관됩니다.",
            "개인정보 접근 권한의 최소화 및 관리",
            "AI API 제공업체 전달 시 미션 추천에 필요한 최소한의 정보만 전송",
          ]}
        />
      </LegalSection>

      <LegalSection heading="제13조 (개인정보 보호책임자)">
        <p>
          운영팀은 개인정보 처리에 관한 업무를 총괄해서 책임지고, 이용자의 불만처리 및 피해구제 등을
          위하여 아래와 같이 개인정보 보호책임자를 지정하고 있습니다.
        </p>
        <LegalList
          items={[
            `담당: ${OPERATOR_NAME}`,
            `연락처: ${PRIVACY_CONTACT_EMAIL}, 마이페이지 내 문의하기(카카오톡 오픈채팅)`,
          ]}
        />
      </LegalSection>

      <LegalSection heading="제14조 (권익침해 구제방법)">
        <p>정보주체는 아래 기관에 개인정보 침해에 대한 피해구제, 상담 등을 문의하실 수 있습니다.</p>
        <LegalList
          items={[
            "개인정보 침해신고센터: (국번없이) 118 (privacy.kisa.or.kr)",
            "개인정보 분쟁조정위원회: (국번없이) 1833-6972 (www.kopico.go.kr)",
            "대검찰청: (국번없이) 1301 (www.spo.go.kr)",
            "경찰청: (국번없이) 182 (ecrm.police.go.kr)",
          ]}
        />
      </LegalSection>

      <LegalSection heading="제15조 (개인정보처리방침의 변경)">
        <LegalOrderedList
          items={[
            `이 개인정보처리방침은 ${POLICY_EFFECTIVE_DATE}부터 적용됩니다.`,
            "법령, 정책 또는 보안 기술의 변경에 따라 내용의 추가·삭제 및 수정이 있을 경우에는 시행 최소 7일 전(중요한 변경의 경우 30일 전)에 공지사항을 통해 고지합니다.",
          ]}
        />
        <p>
          {SERVICE_NAME} · {OPERATOR_NAME}
        </p>
      </LegalSection>
    </LegalPageLayout>
  );
}
