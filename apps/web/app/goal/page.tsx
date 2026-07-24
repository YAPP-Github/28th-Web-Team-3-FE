import { GoalDetail } from "./_components/goal-detail";
import { GoalHeader } from "./_components/goal-header";

export default function GoalPage() {
  return (
    <main className="mx-auto min-h-dvh w-full max-w-md bg-gray-0 pb-10">
      <GoalHeader />
      <GoalDetail />
    </main>
  );
}
