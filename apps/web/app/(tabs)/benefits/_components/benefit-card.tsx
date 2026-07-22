import type { Benefit } from "../types";
import { OfficialLink } from "./official-link";
import { StatusBadge } from "./status-badge";

const CARD_FIELDS = [
  { label: "핵심 조건", key: "condition" },
  { label: "예상 혜택", key: "estimatedSaving" },
  { label: "신청 마감", key: "deadline" },
] as const;

export function BenefitCard({ benefit }: { benefit: Benefit }) {
  return (
    <article className="rounded-[16px] border border-gray-100 bg-gray-0 p-4">
      <header className="flex items-start justify-between gap-3">
        <h2 className="text-body-b1-700 text-gray-900">{benefit.title}</h2>
        <StatusBadge status={benefit.status} />
      </header>

      <p className="mt-2 text-body-b2-400 text-gray-700">{benefit.summary}</p>

      <dl className="mt-3 flex flex-col gap-1.5">
        {CARD_FIELDS.map((field) => (
          <div key={field.key} className="flex gap-2">
            <dt className="w-16 shrink-0 text-caption-c1-500 text-gray-500">{field.label}</dt>
            <dd className="text-caption-c1-500 text-gray-700">{benefit[field.key]}</dd>
          </div>
        ))}
      </dl>

      <p className="mt-3 text-caption-c1-500 text-gray-400">
        조건·예산·모집일은 변동될 수 있어요. 공식 페이지에서 최종 확인해 주세요.
      </p>

      <div className="mt-3 flex flex-wrap gap-3">
        {benefit.officialLinks.map((link) => (
          <OfficialLink key={link.url} href={link.url} label={link.label} />
        ))}
      </div>
    </article>
  );
}
