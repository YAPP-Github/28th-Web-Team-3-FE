/**
 * 홈에서 쓰는 목표 정적 값 — UT 대응 가안. 목표 상세(`/goal`)는 API 실데이터를 쓰므로
 * 여기 값은 홈 라인·홈의 이번 달 목표 현황 카드에만 쓴다.
 */
export const GOAL = {
  /** 홈 "모으기" 라인 제목. */
  title: "5,000만원 모으기",
  /** 홈의 이번 달 목표 현황 카드. */
  monthly: {
    ddayLabel: "D-12",
    currentLabel: "67만 2천원",
    targetLabel: "82만원",
    percent: 82,
  },
} as const;

/** 목표 상세 제목 접미사 — `${금액} 모으기` 형태로 API 목표액에서 파생한다. */
export const GOAL_TITLE_SUFFIX = "모으기";
