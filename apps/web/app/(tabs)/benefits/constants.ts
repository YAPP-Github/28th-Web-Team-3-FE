import type { PolicyCategory } from "@repo/schema/policy";
import type { Benefit, BenefitFilter, FinancialTip } from "./types";

/**
 * 필터 칩. `category`는 서버 `/api/policies`의 `category` 쿼리로 그대로 나가는 값이고,
 * 목록을 좁히는 방식일 뿐인 "전체"·"저장"은 null이다.
 */
export const BENEFIT_FILTERS: readonly {
  value: BenefitFilter;
  label: string;
  category: PolicyCategory | null;
}[] = [
  { value: "all", label: "전체", category: null },
  { value: "saved", label: "저장", category: null },
  { value: "finance", label: "금융", category: "금융" },
  { value: "housing", label: "주거", category: "주거" },
  { value: "welfare", label: "복지", category: "복지" },
  { value: "education", label: "교육", category: "교육" },
];

/**
 * 정적 정책 데이터 — UT 대응 가안(디자인 미확정). 공식 URL은 2026-07-21 기준으로 확인했다.
 * 조건·금액 등 상세는 카드에 싣지 않고 공식 페이지로 바로 보낸다. 출시 전 URL 재검증 필요.
 */
export const BENEFITS = [
  {
    id: "youth-future-savings",
    category: "savings",
    title: "청년미래적금",
    summary: "3년 저축하면 소득·근로 형태에 따라 정부기여금을 더해줘요.",
    condition: "만 19~34세 · 소득 요건 확인",
    officialUrl: "https://fill4young.kinfa.or.kr/",
  },
  {
    id: "youth-tomorrow-savings",
    category: "savings",
    title: "청년내일저축계좌",
    summary: "매월 저축하면 정부가 일정 금액을 함께 적립해줘요.",
    condition: "만 19~34세 · 근로·소득 요건",
    officialUrl:
      "https://www.bokjiro.go.kr/ssis-tbu/twataa/wlfareInfo/moveTWAT52011M.do?wlfareInfoId=WLF00000060&wlfareInfoReldBztpCd=01",
  },
  {
    id: "youth-housing-dream",
    category: "savings",
    title: "청년 주택드림 청약통장",
    summary: "청약 기능에 우대 금리까지 챙기는 청년 전용 통장이에요.",
    condition: "청년·무주택 등 가입 요건",
    officialUrl: "https://nhuf.molit.go.kr/FP/FP07/FP0701/FP07010301.jsp",
  },
  {
    id: "isa",
    category: "savings",
    title: "ISA(개인종합자산관리계좌)",
    summary: "예금·펀드를 한 계좌에서 굴리고 세제 혜택을 받아요.",
    condition: "국내 거주자 누구나",
    officialUrl: "https://isa.kofia.or.kr/",
  },
  {
    id: "youth-monthly-rent",
    category: "housing",
    title: "청년월세 지원",
    summary: "청년 월세를 일정 기간 지원해 주거비 부담을 줄여줘요.",
    condition: "청년 · 소득·거주 요건",
    officialUrl:
      "https://www.bokjiro.go.kr/ssis-tbu/twataa/wlfareInfo/moveTWAT52011M.do?wlfareInfoId=WLF00004661&wlfareInfoReldBztpCd=01",
  },
  {
    id: "youth-jeonse-loan",
    category: "housing",
    title: "청년 버팀목 전세대출",
    summary: "청년 대상 저금리 전세자금 대출이에요.",
    condition: "청년 · 소득·보증금 한도",
    officialUrl: "https://nhuf.molit.go.kr/FP/FP05/FP0502/FP05020301.jsp",
  },
  {
    id: "deposit-return-guarantee",
    category: "housing",
    title: "전세보증금 반환보증 보증료 지원",
    summary: "반환보증 가입 시 내는 보증료 일부를 돌려줘요.",
    condition: "전세 세입자 · 소득 요건",
    officialUrl: "https://www.khug.or.kr/jeonse/web/s05/s050601.jsp",
  },
  {
    id: "k-pass",
    category: "living",
    title: "K-패스",
    summary: "대중교통 이용액 일부를 다음 달에 환급받아요.",
    condition: "대중교통 이용자 · 가입 필요",
    officialUrl: "https://korea-pass.kr/info/intro.do",
  },
  {
    id: "climate-card",
    category: "living",
    title: "기후동행카드",
    summary: "정액권 하나로 서울 대중교통을 무제한 이용해요.",
    condition: "서울 대중교통 이용자",
    officialUrl: "https://news.seoul.go.kr/traffic/archives/510963",
  },
  {
    id: "nonghal-voucher",
    category: "living",
    title: "농할상품권",
    summary: "농축산물 구매 시 할인받는 상품권이에요.",
    condition: "전 국민 · 판매처 확인",
    officialUrl: "https://www.mafra.go.kr/bbs/home/796/576815/artclView.do",
  },
  {
    id: "onnuri-voucher",
    category: "living",
    title: "온누리상품권",
    summary: "전통시장에서 할인가로 쓰는 상품권이에요.",
    condition: "전 국민 · 가맹점 확인",
    officialUrl: "https://onnurigift.or.kr/",
  },
  {
    id: "energy-voucher",
    category: "living",
    title: "에너지바우처",
    summary: "냉난방 등 에너지 비용을 지원받아요.",
    condition: "취약계층 · 소득·세대 요건",
    officialUrl: "https://www.energyv.or.kr/",
  },
  {
    id: "culture-nuri-card",
    category: "living",
    title: "문화누리카드",
    summary: "문화·여행·체육에 쓰는 통합문화이용권이에요.",
    condition: "기초수급·차상위 계층",
    officialUrl: "https://www.mnuri.kr/munhwa/introduceNuri.do",
  },
  {
    id: "earned-income-tax-credit",
    category: "tax",
    title: "근로장려금",
    summary: "일하는 저소득 가구에 소득에 따라 장려금을 지급해요.",
    condition: "저소득 근로·사업 가구",
    officialUrl: "https://www.nts.go.kr/nts/cm/cntnts/cntntsView.do?cntntsId=7784&mi=2450",
  },
  {
    id: "sme-youth-tax-reduction",
    category: "tax",
    title: "중소기업 취업 청년 소득세 감면",
    summary: "중소기업에 취업한 청년의 소득세를 일정 기간 감면해줘요.",
    condition: "중소기업 취업 청년",
    officialUrl: "https://www.nts.go.kr/nts/cm/cntnts/cntntsView.do?cntntsId=239023",
  },
  {
    id: "monthly-rent-tax-credit",
    category: "tax",
    title: "월세 세액공제",
    summary: "무주택 근로자가 낸 월세 일부를 세액공제로 돌려받아요.",
    condition: "무주택 근로자 · 소득 요건",
    officialUrl: "https://www.nts.go.kr/nts/cm/cntnts/cntntsView.do?cntntsId=239025&mi=40634",
  },
] satisfies Benefit[];

export const FINANCIAL_TIPS = [
  {
    id: "youth-future-savings",
    category: "정부 정책",
    title: "20대 필수, 청년 미래적금 가입조건 정리",
    summary: "최대 2,255만원 수령 가능",
  },
  {
    id: "delivery-saving",
    category: "절약 꿀팁",
    title: "배달비만 줄여도 쏠쏠해요",
    summary: "1인 가구 식비 절약법",
  },
  {
    id: "subscription-saving",
    category: "고정비 관리",
    title: "안 쓰는 구독은 이번 달에 정리해요",
    summary: "월 1만원부터 모아보기",
  },
] satisfies readonly FinancialTip[];
