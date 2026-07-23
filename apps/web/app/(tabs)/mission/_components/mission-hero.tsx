import CoinIcon from "@repo/ui/svg/coin.svg";
import Image from "next/image";

export function MissionHero() {
  return (
    <section className="relative flex min-h-64 flex-col gap-8 overflow-hidden bg-gray-50 px-5 pt-2">
      <h1 className="text-title-t1-700">미션</h1>
      <div className="flex flex-col items-start gap-3">
        <span className="rounded bg-gray-100 px-2 py-0.5 text-body-b2-700 text-gray-700">D-7</span>
        <div className="flex flex-col gap-0.5">
          <p className="text-headline-h2-700 text-blue-600">10% 달성</p>
          <p className="text-body-b2-500 text-gray-800">미션 5개 더 달성시 5%증가</p>
        </div>
        <p className="flex items-center gap-1 text-body-b2-500">
          <CoinIcon aria-hidden="true" className="size-[21px] shrink-0 overflow-visible" />
          +1
        </p>
      </div>
      <div aria-hidden="true" className="absolute right-1 bottom-3 h-40 w-52">
        <Image
          fill
          alt=""
          className="object-contain"
          priority
          sizes="208px"
          src="/images/mission-home.webp"
        />
      </div>
    </section>
  );
}
