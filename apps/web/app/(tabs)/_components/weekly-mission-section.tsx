"use client";

import { buttonVariants, cn } from "@repo/ui";
import CoinIcon from "@repo/ui/svg/coin.svg";
import { Check, ChevronDown, ChevronRight, ChevronUp } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import {
  HOME_MISSION_CATEGORIES,
  type HomeMission,
  type HomeMissionCategory,
} from "@/app/(tabs)/constants/home";
import { SectionHeader } from "./section-header";

interface WeeklyMissionSectionProps {
  missions: readonly HomeMission[];
}

export function WeeklyMissionSection({ missions }: WeeklyMissionSectionProps) {
  const [category, setCategory] = useState<HomeMissionCategory>("전체");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const visibleMissions = missions.filter(
    (mission) => category === "전체" || mission.category === category,
  );
  const hasMissions = missions.length > 0;

  return (
    <section className="flex flex-col pt-8">
      <div className="px-5 pb-5">
        <SectionHeader title="이번 주 미션">
          <Link
            aria-label="미션 전체 보기"
            className="rounded-md text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300"
            href="/mission"
          >
            <ChevronRight aria-hidden="true" className="size-5" />
          </Link>
        </SectionHeader>
      </div>

      <MissionProgress hasMissions={hasMissions} />

      {hasMissions ? (
        <div className="flex flex-col gap-4 px-5 pt-6">
          <div aria-label="홈 미션 카테고리" className="flex gap-1.5" role="tablist">
            {HOME_MISSION_CATEGORIES.map((item) => (
              <button
                key={item}
                aria-selected={category === item}
                className={cn(
                  "rounded-lg px-4 py-1.5 text-body-b2-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300",
                  category === item ? "bg-gray-800 text-gray-0" : "bg-gray-50 text-gray-400",
                )}
                role="tab"
                type="button"
                onClick={() => setCategory(item)}
              >
                {item}
              </button>
            ))}
          </div>

          <div className="flex flex-col gap-3">
            {visibleMissions.map((mission) => {
              const isExpanded = expandedId === mission.id;
              return (
                <div
                  key={mission.id}
                  className="flex flex-col gap-3 rounded-xl bg-gray-50 px-3.5 py-3.5"
                >
                  <button
                    aria-expanded={isExpanded}
                    className="flex w-full items-center gap-2 rounded-md text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300"
                    type="button"
                    onClick={() =>
                      setExpandedId((current) => (current === mission.id ? null : mission.id))
                    }
                  >
                    <span className="flex size-5 shrink-0 items-center justify-center rounded-full border border-gray-400">
                      <Check aria-hidden="true" className="size-3 text-gray-400" />
                    </span>
                    <span className="min-w-0 flex-1 text-body-b1-700 text-gray-900">
                      {mission.title}
                    </span>
                    {isExpanded ? (
                      <ChevronUp aria-hidden="true" className="size-5 shrink-0 text-gray-400" />
                    ) : (
                      <ChevronDown aria-hidden="true" className="size-5 shrink-0 text-gray-400" />
                    )}
                  </button>
                  {isExpanded && mission.description ? (
                    <p className="pl-7 text-body-b2-500 text-gray-700">
                      <span className="mr-2 rounded bg-blue-100 px-1.5 py-1 text-blue-600">
                        달성 시
                      </span>
                      {mission.description}
                    </p>
                  ) : null}
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-5 px-5 py-16 text-center">
          <p className="text-body-b2-500 text-gray-500">
            미션이 없어요.
            <br />
            절약 미션을 추가하고 달성해보세요.
          </p>
          <Link
            className={buttonVariants({
              size: "cta",
              variant: "onboardingBack",
            })}
            href="/mission/new"
          >
            5,000만원 달성을 위한 미션 추가
          </Link>
        </div>
      )}
    </section>
  );
}

function MissionProgress({ hasMissions }: { hasMissions: boolean }) {
  const progressLabel = hasMissions ? "10% 달성" : "0% 달성";

  return (
    <div className="flex flex-row justify-between bg-gray-50 px-5 py-[10px]">
      <div className="flex flex-col justify-center gap-2">
        <span className="w-fit rounded bg-gray-100 px-2 py-1 text-body-b2-700 text-gray-700">
          D-2
        </span>
        <div className="flex flex-col gap-[1px]">
          <strong className="text-title-t1-700 text-gray-900">{progressLabel}</strong>
          <p className="text-caption-c1-500 text-gray-700">미션을 추가하고 달성해보세요!</p>
        </div>
        <span className="flex items-center gap-1 text-body-b2-500 text-gray-800">
          <CoinIcon aria-hidden="true" />
          +0
        </span>
      </div>
      <Image
        alt=""
        aria-hidden="true"
        className="pointer-events-none h-32 w-auto object-contain"
        height={256}
        priority
        src="/images/mission-home.webp"
        width={384}
      />
    </div>
  );
}
