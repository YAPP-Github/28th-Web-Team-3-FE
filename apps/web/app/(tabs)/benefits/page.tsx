import { BenefitsExplorer } from "./_components/benefits-explorer";
import { parseBenefitCategory } from "./lib/filter-benefits";

interface BenefitsPageProps {
  searchParams: Promise<{ category?: string | string[] }>;
}

export default async function BenefitsPage({ searchParams }: BenefitsPageProps) {
  const initialCategory = parseBenefitCategory((await searchParams).category);

  return (
    <main className="mx-auto min-h-dvh max-w-md bg-gray-50 px-5 py-6 pb-24">
      <header className="mb-5 flex flex-col gap-1">
        <h1 className="text-headline-h2-700 text-gray-900">정책 혜택</h1>
        <p className="text-body-b2-400 text-gray-600">
          저축부터 주거비, 세금 환급까지 받을 수 있는 혜택을 확인해 보세요.
        </p>
      </header>

      <BenefitsExplorer initialCategory={initialCategory} />

      <p className="mt-6 text-center text-caption-c1-500 text-gray-400">
        정책 내용은 변동될 수 있어요. 공식 페이지 기준으로 확인해 주세요.
      </p>
    </main>
  );
}
