import { SavedBenefits } from "./_components/saved-benefits";
import { SavedBenefitsHeader } from "./_components/saved-benefits-header";

export default function SavedBenefitsPage() {
  return (
    <main className="flex flex-1 flex-col bg-gray-0">
      <SavedBenefitsHeader />
      <SavedBenefits />
    </main>
  );
}
