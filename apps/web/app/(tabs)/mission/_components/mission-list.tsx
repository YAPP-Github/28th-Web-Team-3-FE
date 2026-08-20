import type { Mission } from "@repo/schema/mission";
import CoinIcon from "@repo/ui/svg/coin.svg";
import { Check, ChevronDown, ChevronUp } from "lucide-react";

interface MissionListProps {
  completedMissions: readonly Mission[];
  expandedMissionId: string | null;
  missions: readonly Mission[];
  onComplete: (mission: Mission) => void;
  onDelete: (mission: Mission) => void;
  deletingMissionId?: string | null;
  onToggle: (id: string) => void;
}

export function MissionList({
  completedMissions,
  expandedMissionId,
  missions,
  onComplete,
  onDelete,
  deletingMissionId,
  onToggle,
}: MissionListProps) {
  return (
    <div className="flex flex-col gap-5">
      <section className="flex flex-col gap-2">
        <h2 className="text-body-b2-700 text-gray-700">진행 중</h2>
        {missions.length === 0 ? (
          <div className="flex h-[90px] flex-col items-center justify-center text-center text-body-b1-500 text-gray-600">
            <p>미션이 없어요.</p>
            <p>절약 미션을 추가하고 달성해보세요.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {missions.map((mission) => {
              const isExpanded = expandedMissionId === mission.id;
              const isDeleting = deletingMissionId === mission.id;
              const savingsLabel =
                mission.savingsLabel ?? "예상 절약 금액이 없는 직접 추가 미션이에요.";
              return (
                <article
                  key={mission.id}
                  className="flex flex-col gap-3 rounded-xl bg-gray-10 px-3.5 py-[14px]"
                >
                  <div className="flex w-full items-center gap-2">
                    <button
                      aria-label="미션 완료"
                      className="flex size-5 shrink-0 items-center justify-center rounded-full border border-gray-400 bg-gray-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      type="button"
                      onClick={() => onComplete(mission)}
                    >
                      <Check aria-hidden="true" className="size-3 text-gray-400" />
                    </button>
                    <button
                      aria-expanded={isExpanded}
                      className="flex min-w-0 flex-1 items-center gap-2 rounded-md text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      type="button"
                      onClick={() => onToggle(mission.id)}
                    >
                      <span className="min-w-0 flex-1 text-body-b1-700 text-gray-900">
                        {mission.title}
                      </span>
                      {isExpanded ? (
                        <ChevronUp aria-hidden="true" className="size-5 shrink-0 text-gray-400" />
                      ) : (
                        <ChevronDown aria-hidden="true" className="size-5 shrink-0 text-gray-400" />
                      )}
                    </button>
                  </div>
                  {isExpanded ? (
                    <>
                      <p className="flex gap-3 pl-0 text-body-b2-500 text-gray-700">
                        <span className="h-fit shrink-0 rounded bg-blue-100 px-1.5 py-1 text-caption-c1-700 text-blue-600">
                          달성 시
                        </span>
                        <span>{savingsLabel}</span>
                      </p>
                      <button
                        aria-label="미션 삭제"
                        className="flex h-11 w-full items-center justify-center rounded-xl bg-gray-100 text-body-b1-700 text-gray-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
                        disabled={isDeleting}
                        type="button"
                        onClick={() => onDelete(mission)}
                      >
                        {isDeleting ? "삭제 중" : "삭제"}
                      </button>
                    </>
                  ) : null}
                </article>
              );
            })}
          </div>
        )}
      </section>

      {completedMissions.length > 0 ? (
        <section className="flex flex-col gap-2">
          <h2 className="text-body-b2-700 text-gray-700">완료</h2>
          <div className="flex flex-col gap-2">
            {completedMissions.map((mission) => (
              <article
                key={mission.id}
                className="flex items-center gap-2 rounded-xl bg-blue-50 px-3.5 py-[14px]"
              >
                <CoinIcon aria-hidden="true" className="size-[21px] shrink-0 overflow-visible" />
                <span className="text-body-b1-700">{mission.title}</span>
              </article>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
