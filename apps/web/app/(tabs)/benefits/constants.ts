import type { Benefit, BenefitCategory } from "./types";

export const BENEFIT_CATEGORIES: readonly { value: BenefitCategory; label: string }[] = [
  { value: "all", label: "전체" },
  { value: "savings", label: "저축·자산형성" },
  { value: "housing", label: "주거비" },
  { value: "living", label: "교통·생활비" },
  { value: "tax", label: "세금·환급" },
];

/**
 * 정적 정책 데이터. 공식 URL은 2026-07-21 기준으로 확인했다.
 * 신청 상태·지원 금액은 수시로 바뀌므로 실시간 검증 전에는 모두 "조건 확인 필요"로 두고,
 * 구체 수치 대신 "공식 안내 확인" 문구를 사용한다. 최종 확인은 공식 페이지 몫이다.
 */
export const BENEFITS = [
  {
    id: "youth-future-savings",
    category: "savings",
    title: "청년미래적금",
    status: "check-required",
    summary: "3년 동안 저축하면 소득과 근로 형태에 따라 정부기여금을 받을 수 있어요.",
    condition: "만 19~34세, 소득 및 가입 가능 여부 확인 필요",
    estimatedSaving: "월 최대 50만원 납입 기준",
    deadline: "공식 모집 일정 확인 필요",
    officialLinks: [{ label: "청년미래적금 공식 안내", url: "https://fill4young.kinfa.or.kr/" }],
  },
  {
    id: "youth-tomorrow-savings",
    category: "savings",
    title: "청년내일저축계좌",
    status: "check-required",
    summary: "매월 저축하면 정부가 일정 금액을 함께 적립해 목돈 마련을 도와줘요.",
    condition: "만 19~34세, 근로·소득 요건 확인 필요",
    estimatedSaving: "본인 저축액에 정부 매칭 지원",
    deadline: "공식 모집 일정 확인 필요",
    officialLinks: [
      {
        label: "청년내일저축계좌 공식 안내",
        url: "https://www.bokjiro.go.kr/ssis-tbu/twataa/wlfareInfo/moveTWAT52011M.do?wlfareInfoId=WLF00000060&wlfareInfoReldBztpCd=01",
      },
    ],
  },
  {
    id: "youth-housing-dream",
    category: "savings",
    title: "청년 주택드림 청약통장",
    status: "check-required",
    summary: "청약 기능과 우대 금리를 함께 제공하는 청년 전용 통장이에요.",
    condition: "청년·무주택 등 가입 요건 확인 필요",
    estimatedSaving: "우대금리 및 비과세 혜택",
    deadline: "상시(가입 요건 확인 필요)",
    officialLinks: [
      {
        label: "주택드림 청약통장 공식 안내",
        url: "https://nhuf.molit.go.kr/FP/FP07/FP0701/FP07010301.jsp",
      },
    ],
  },
  {
    id: "isa",
    category: "savings",
    title: "ISA(개인종합자산관리계좌)",
    status: "check-required",
    summary: "예금·펀드 등을 한 계좌에서 운용하고 이자·배당에 세제 혜택을 받을 수 있어요.",
    condition: "거주자 요건·계좌 유형 확인 필요",
    estimatedSaving: "순이익 비과세·분리과세 한도",
    deadline: "상시",
    officialLinks: [{ label: "ISA 공식 안내", url: "https://isa.kofia.or.kr/" }],
  },
  {
    id: "youth-monthly-rent",
    category: "housing",
    title: "청년월세 지원",
    status: "check-required",
    summary: "청년에게 월세 일부를 일정 기간 지원해 주거비 부담을 덜어줘요.",
    condition: "소득·거주 요건 확인 필요",
    estimatedSaving: "월 일정액, 최대 지원 기간 확인 필요",
    deadline: "공식 모집 일정 확인 필요",
    officialLinks: [
      {
        label: "청년월세 지원 공식 안내",
        url: "https://www.bokjiro.go.kr/ssis-tbu/twataa/wlfareInfo/moveTWAT52011M.do?wlfareInfoId=WLF00004661&wlfareInfoReldBztpCd=01",
      },
    ],
  },
  {
    id: "youth-jeonse-loan",
    category: "housing",
    title: "청년 버팀목 전세대출",
    status: "check-required",
    summary: "청년을 위한 저금리 전세자금 대출로 보증금 마련을 도와줘요.",
    condition: "소득·보증금 한도 확인 필요",
    estimatedSaving: "저금리 대출",
    deadline: "상시(요건 확인 필요)",
    officialLinks: [
      {
        label: "버팀목 전세대출 공식 안내",
        url: "https://nhuf.molit.go.kr/FP/FP05/FP0502/FP05020301.jsp",
      },
    ],
  },
  {
    id: "deposit-return-guarantee",
    category: "housing",
    title: "전세보증금 반환보증 보증료 지원",
    status: "check-required",
    summary: "전세보증금 반환보증에 가입할 때 내는 보증료 일부를 지원해요.",
    condition: "대상·소득 요건 확인 필요",
    estimatedSaving: "보증료 일부 지원",
    deadline: "공식 안내 확인 필요",
    officialLinks: [
      {
        label: "반환보증 보증료 지원 공식 안내",
        url: "https://www.khug.or.kr/jeonse/web/s05/s050601.jsp",
      },
    ],
  },
  {
    id: "k-pass",
    category: "living",
    title: "K-패스",
    status: "check-required",
    summary: "대중교통 이용액의 일부를 환급해 주는 교통비 지원 제도예요.",
    condition: "이용 횟수·지역 요건 확인 필요",
    estimatedSaving: "이용액의 일정 비율 환급",
    deadline: "상시(가입 필요)",
    officialLinks: [{ label: "K-패스 공식 안내", url: "https://korea-pass.kr/info/intro.do" }],
  },
  {
    id: "climate-card",
    category: "living",
    title: "기후동행카드",
    status: "check-required",
    summary: "정액권으로 대중교통을 무제한 이용하는 서울 교통 정기권이에요.",
    condition: "서울 대중교통 이용자, 이용 범위 확인 필요",
    estimatedSaving: "월 정액 무제한 이용",
    deadline: "상시",
    officialLinks: [
      {
        label: "기후동행카드 공식 안내",
        url: "https://news.seoul.go.kr/traffic/archives/510963",
      },
    ],
  },
  {
    id: "gift-voucher",
    category: "living",
    title: "농할상품권·온누리상품권",
    status: "check-required",
    summary: "전통시장·농산물 구매 시 할인받을 수 있는 상품권이에요.",
    condition: "판매처·구매 한도 확인 필요",
    estimatedSaving: "구매 시 일정 비율 할인",
    deadline: "공식 판매 일정 확인 필요",
    officialLinks: [
      {
        label: "농할상품권 공식 안내",
        url: "https://www.mafra.go.kr/bbs/home/796/576815/artclView.do",
      },
      { label: "온누리상품권 공식 안내", url: "https://onnurigift.or.kr/" },
    ],
  },
  {
    id: "energy-voucher",
    category: "living",
    title: "에너지바우처",
    status: "check-required",
    summary: "취약계층의 냉난방 등 에너지 비용을 지원해요.",
    condition: "소득·세대원 요건 확인 필요",
    estimatedSaving: "세대 유형별 지원금",
    deadline: "공식 신청 일정 확인 필요",
    officialLinks: [
      {
        label: "에너지바우처 공식 안내",
        url: "https://www.bokjiro.go.kr/ssis-tbu/cms/pc/main/popup/1309903_1245.html",
      },
    ],
  },
  {
    id: "culture-nuri-card",
    category: "living",
    title: "문화누리카드",
    status: "check-required",
    summary: "문화·여행·체육 활동에 쓸 수 있는 통합문화이용권이에요.",
    condition: "기초생활수급자·차상위계층 등 대상 확인 필요",
    estimatedSaving: "연 일정액 지원",
    deadline: "공식 발급 일정 확인 필요",
    officialLinks: [
      { label: "문화누리카드 공식 안내", url: "https://www.mnuri.kr/munhwa/introduceNuri.do" },
    ],
  },
  {
    id: "earned-income-tax-credit",
    category: "tax",
    title: "근로장려금",
    status: "check-required",
    summary: "일하는 저소득 가구에 소득에 따라 지급하는 장려금이에요.",
    condition: "소득·재산 요건 확인 필요",
    estimatedSaving: "가구 유형별 지급액",
    deadline: "정기·반기 신청 일정 확인 필요",
    officialLinks: [
      {
        label: "근로장려금 공식 안내",
        url: "https://www.nts.go.kr/nts/cm/cntnts/cntntsView.do?cntntsId=7784&mi=2450",
      },
    ],
  },
  {
    id: "sme-youth-tax-reduction",
    category: "tax",
    title: "중소기업 취업 청년 소득세 감면",
    status: "check-required",
    summary: "중소기업에 취업한 청년의 소득세를 일정 기간 감면해 줘요.",
    condition: "연령·업종·취업 요건 확인 필요",
    estimatedSaving: "소득세 감면(한도 있음)",
    deadline: "취업 후 신청",
    officialLinks: [
      {
        label: "청년 소득세 감면 공식 안내",
        url: "https://www.nts.go.kr/nts/cm/cntnts/cntntsView.do?cntntsId=239023",
      },
    ],
  },
  {
    id: "monthly-rent-tax-credit",
    category: "tax",
    title: "월세 세액공제",
    status: "check-required",
    summary: "무주택 근로자가 낸 월세의 일부를 세액공제로 돌려받을 수 있어요.",
    condition: "소득·주택 요건 확인 필요",
    estimatedSaving: "월세액의 일정 비율 공제",
    deadline: "연말정산·종합소득세 신고 시",
    officialLinks: [
      {
        label: "월세 세액공제 공식 안내",
        url: "https://www.nts.go.kr/nts/cm/cntnts/cntntsView.do?cntntsId=239025&mi=40634",
      },
    ],
  },
] satisfies Benefit[];
