import type { ReactNode } from "react";
import { MissionSurveyFormProvider } from "./_components/mission-survey-form-provider";

export default function MissionLayout({ children }: { children: ReactNode }) {
  return <MissionSurveyFormProvider>{children}</MissionSurveyFormProvider>;
}
