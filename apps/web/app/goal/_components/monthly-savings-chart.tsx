import type { MonthlySaving } from "@repo/schema/goal";
import { useEffect, useRef } from "react";
import { formatManwon } from "@/lib/format";

const BAR_HEIGHT = 134;

function formatMonth({ current, yearMonth }: MonthlySaving) {
  if (current) return "이번 달";
  return `${Number(yearMonth.slice(5))}월`;
}

function calculateBarHeight(savedManwon: number, maxManwon: number) {
  if (savedManwon <= 0) return 0;
  return Math.max(8, Math.round((savedManwon / maxManwon) * BAR_HEIGHT));
}

interface MonthlySavingsChartProps {
  monthlySavings: MonthlySaving[];
  targetManwon: number;
}

/** 목표 시작월부터 이번 달까지 저축액을 보여주는 가로 스크롤 막대그래프. */
export function MonthlySavingsChart({ monthlySavings, targetManwon }: MonthlySavingsChartProps) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const currentRef = useRef<HTMLLIElement>(null);
  const maxManwon = Math.max(
    targetManwon,
    ...monthlySavings.map(({ savedManwon }) => savedManwon),
    1,
  );

  useEffect(() => {
    const viewport = viewportRef.current;
    const current = currentRef.current;
    if (!viewport || !current || typeof viewport.scrollTo !== "function") return;

    viewport.scrollTo({
      left: Math.max(0, current.offsetLeft - viewport.clientWidth + current.clientWidth),
    });
  }, []);

  return (
    <section className="pt-8">
      <h2 className="px-5 text-title-t2-700 text-gray-900">월별 저축 현황</h2>
      <div
        className="mt-0.5 h-[217px] overflow-x-auto overflow-y-hidden px-5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        ref={viewportRef}
      >
        <ol aria-label="월별 저축 현황" className="flex min-w-max gap-[18px] pt-[59px]">
          {monthlySavings.map((saving) => {
            const label = formatMonth(saving);
            const height = calculateBarHeight(saving.savedManwon, maxManwon);

            return (
              <li
                aria-label={`${label}: ${formatManwon(saving.savedManwon)}`}
                className="relative flex w-9 shrink-0 flex-col items-center gap-1.5"
                key={saving.yearMonth}
                ref={saving.current ? currentRef : undefined}
              >
                {saving.current ? (
                  <div className="absolute -top-[59px] left-1/2 flex h-[53px] w-[82px] -translate-x-1/2 flex-col justify-center rounded-lg bg-gray-900 px-2 text-center text-caption-c1-500 text-gray-0 after:absolute after:bottom-[-5px] after:left-1/2 after:size-2.5 after:-translate-x-1/2 after:rotate-45 after:bg-gray-900">
                    <span className="relative z-10 whitespace-nowrap">
                      목표: {formatManwon(targetManwon)}
                    </span>
                    <span className="relative z-10 whitespace-nowrap">
                      달성: {formatManwon(saving.savedManwon)}
                    </span>
                  </div>
                ) : null}
                <div className="relative h-[134px] w-9 overflow-hidden rounded-xl bg-gray-50">
                  {height > 0 ? (
                    <span
                      aria-hidden="true"
                      className={`absolute inset-x-0 bottom-0 rounded-xl ${
                        saving.current ? "bg-blue-400" : "bg-gray-400"
                      }`}
                      style={{ height }}
                    />
                  ) : null}
                </div>
                <span className="whitespace-nowrap text-caption-c1-500 text-gray-600">{label}</span>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
