import type { MissionSuggestion } from "../constants/mission-creation";

export function MissionSuggestionCard({ description, title }: MissionSuggestion) {
  return (
    <article className="flex flex-col gap-3 rounded-xl border border-gray-100 bg-gray-0 p-3">
      <h3 className="text-body-b1-700 text-gray-900">{title}</h3>
      <p className="flex items-start gap-2 text-body-b2-400 text-gray-700">
        <span className="shrink-0 rounded bg-gray-50 px-1.5 py-1 text-caption-c1-700 text-gray-600">
          달성 시
        </span>
        <span>{description}</span>
      </p>
    </article>
  );
}
