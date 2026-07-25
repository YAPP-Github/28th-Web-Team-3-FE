import CoinIcon from "@repo/ui/svg/coin.svg";
import Image from "next/image";

interface MissionHeroProps {
  ddayLabel: string;
  percent: number;
  /** 완료한 미션 수 — 완료 1건당 코인 1개. */
  completedCount: number;
}

export function MissionHero({ ddayLabel, percent, completedCount }: MissionHeroProps) {
  return (
    <section className="relative flex min-h-64 flex-col gap-8 overflow-hidden bg-gray-50 px-5 pt-2">
      <h1 className="text-title-t1-700">미션</h1>
      <div className="flex flex-col items-start gap-3">
        <span className="rounded bg-gray-100 px-2 py-0.5 text-body-b2-700 text-gray-700">
          {ddayLabel}
        </span>
        <div className="flex flex-col gap-0.5">
          <p className="text-headline-h2-700 text-blue-600">{percent}% 달성</p>
        </div>
        <p className="flex items-center gap-1 text-body-b2-500">
          <CoinIcon aria-hidden="true" className="size-[21px] shrink-0 overflow-visible" />+
          {completedCount}
        </p>
      </div>
      <div aria-hidden="true" className="absolute right-1 bottom-3 h-40 w-52">
        <Image
          fill
          alt=""
          className="object-contain"
          preload
          sizes="208px"
          src="/images/mission-home.webp"
        />
      </div>
    </section>
  );
}
