import type { ReactNode } from "react";
import { QuestionHeader } from "@/app/onboarding/_components/question-header";

export default function QuestionsLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <QuestionHeader />
      {children}
    </>
  );
}
