import { Button } from "@repo/ui";
import CoinIcon from "@repo/ui/svg/coin.svg";
import { Check, ChevronDown, ChevronUp } from "lucide-react";
import type { Mission } from "../constants/mission";

interface MissionListProps {
  completedMissions: readonly Mission[];
  expandedMissionId: string | null;
  missions: readonly Mission[];
  onDelete: (id: string) => void;
  onToggle: (id: string) => void;
}

export function MissionList({
  completedMissions,
  expandedMissionId,
  missions,
  onDelete,
  onToggle,
}: MissionListProps) {
  return (
    <div className="flex flex-col gap-5">
      <section className="flex flex-col gap-2">
        <h2 className="text-body-b2-700 text-gray-700">진행 중</h2>
        <div className="flex flex-col gap-2">
          {missions.map((mission) => {
            const isExpanded = expandedMissionId === mission.id;
            return (
              <article
                key={mission.id}
                className="flex flex-col gap-3 rounded-xl bg-gray-50 px-3.5 py-[14px]"
              >
                <button
                  aria-expanded={isExpanded}
                  className="flex w-full items-center gap-2 rounded-md text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300"
                  type="button"
                  onClick={() => onToggle(mission.id)}
                >
                  <span className="flex size-5 shrink-0 items-center justify-center rounded-full border border-gray-400">
                    <Check aria-hidden="true" className="size-3 text-gray-400" />
                  </span>
                  <span className="min-w-0 flex-1 text-body-b1-700">{mission.title}</span>
                  {isExpanded ? (
                    <ChevronUp aria-hidden="true" className="size-5 text-gray-400" />
                  ) : (
                    <ChevronDown aria-hidden="true" className="size-5 text-gray-400" />
                  )}
                </button>
                {isExpanded && mission.description ? (
                  <div className="flex flex-col gap-4 pl-7">
                    <p className="text-body-b2-500 text-gray-700">
                      <span className="mr-2 rounded bg-blue-100 px-1.5 py-1 text-blue-600">
                        달성 시
                      </span>
                      {mission.description}
                    </p>
                    <div className="flex gap-2">
                      <Button
                        className="flex-1 bg-gray-100 py-2.5 text-black"
                        type="button"
                        onClick={() => onDelete(mission.id)}
                      >
                        <p className="text-body-b2-700">삭제</p>
                      </Button>
                      <Button className="flex-1 py-2.5" disabled type="button">
                        수정
                      </Button>
                    </div>
                  </div>
                ) : null}
              </article>
            );
          })}
        </div>
      </section>

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
    </div>
  );
}
