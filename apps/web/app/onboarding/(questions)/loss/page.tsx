import { SINGLE_CHOICE_QUESTIONS } from "../../constants/questions";
import { SingleChoiceQuestion } from "../_components/single-choice-question";

export default function LossOnboardingPage() {
  return <SingleChoiceQuestion question={SINGLE_CHOICE_QUESTIONS.loss} />;
}
