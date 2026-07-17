import { SINGLE_CHOICE_QUESTIONS } from "../../constants/questions";
import { SingleChoiceQuestion } from "../_components/single-choice-question";

export default function InterestOnboardingPage() {
  return <SingleChoiceQuestion question={SINGLE_CHOICE_QUESTIONS.interest} />;
}
