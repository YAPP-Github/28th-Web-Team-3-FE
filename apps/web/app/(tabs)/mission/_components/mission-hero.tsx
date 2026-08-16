import HomeMissionCoin from "@repo/ui/svg/home-mission-coin.svg";
import { PigboxProgressGauge } from "@/app/(tabs)/_components/pigbox-progress-gauge";
import { SAFE_AREA_HERO_ATTRIBUTE } from "@/lib/safe-area-bands";
import { formatSavedWon } from "../lib/format";

interface MissionHeroProps {
  ddayLabel: string;
  percent: number;
  /** 완료한 미션 수 — 완료 1건당 코인 1개. */
  completedCount: number;
  savedWon: number;
}

export function MissionHero({ ddayLabel, percent, completedCount, savedWon }: MissionHeroProps) {
  return (
    // 표시는 safe-area 밴드가 스크롤을 따라가게 한다(`lib/safe-area-bands.ts`).
    <section
      {...{ [SAFE_AREA_HERO_ATTRIBUTE]: "" }}
      className="relative flex h-[225px] shrink-0 flex-col gap-8 overflow-hidden bg-gray-50 px-5 pt-2"
    >
      <h1 className="text-title-t1-700 text-gray-900">미션</h1>
      <div className="flex flex-col items-start gap-3">
        <span className="rounded bg-gray-100 px-2 py-0.5 text-body-b2-700 text-gray-700">
          {ddayLabel}
        </span>
        <p className="text-headline-h2-700 text-gray-900">{percent}% 달성</p>
        <p className="flex items-center gap-1.5 text-body-b2-500 text-gray-900">
          <HomeMissionCoin aria-hidden="true" className="h-[19px] w-7 shrink-0" />약{" "}
          {formatSavedWon(savedWon)} 절약했어요
        </p>
      </div>
      <PigboxProgressGauge
        className="absolute top-[66px] right-[33px]"
        completedCount={completedCount}
        progress={percent}
      />
    </section>
  );
}
