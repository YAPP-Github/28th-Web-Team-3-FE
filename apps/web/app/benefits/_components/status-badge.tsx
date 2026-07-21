import type { BenefitStatus } from "../types";

// 현재 정적 데이터는 전부 "check-required"지만, 실시간 상태 연동 시 나머지 상태도
// 그대로 쓰도록 4종을 모두 정의해 둔다.
const STATUS_CONFIG: Record<BenefitStatus, { label: string; className: string }> = {
  available: { label: "신청 가능", className: "bg-success/20 text-gray-900" },
  scheduled: { label: "모집 예정", className: "bg-blue-50 text-blue-600" },
  closed: { label: "마감", className: "bg-gray-100 text-gray-500" },
  "check-required": { label: "조건 확인 필요", className: "bg-warning/25 text-gray-900" },
};

export function StatusBadge({ status }: { status: BenefitStatus }) {
  const { label, className } = STATUS_CONFIG[status];
  return (
    <span
      className={`inline-flex h-6 shrink-0 items-center whitespace-nowrap rounded-full px-2.5 text-caption-c1-500 ${className}`}
    >
      {label}
    </span>
  );
}
