/**
 * 목표(모으기) 정적 데이터 — UT 대응 가안. BE 계약 확정 전이라 표시 문자열을 그대로 박는다.
 * 진행률(percent)만 게이지·프로그레스 바 계산에 쓰므로 숫자로 둔다.
 * 홈의 모으기 라인과 목표 상세 화면이 공유한다.
 */
export const GOAL = {
  /** 목표 이름 — 홈 라인·상세 헤더 공용. */
  title: "5,000만원 모으기",
  /** 전체 저축 진행 (반원 게이지). */
  savedLabel: "1,950만원",
  minLabel: "0",
  maxLabel: "5,000만원",
  savedPercent: 39,
  /** 상세 상단 스탯 카드. */
  usageMonthsLabel: "8개월째",
  ddayLabel: "D-486",
  /** 이번 달 목표 현황 카드 — 홈·상세 공용. */
  monthly: {
    ddayLabel: "D-12",
    currentLabel: "67만 2천원",
    targetLabel: "82만원",
    percent: 82,
  },
} as const;
