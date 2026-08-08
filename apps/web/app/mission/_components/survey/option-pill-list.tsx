import { Toggle } from "@repo/ui";

interface OptionPillListProps {
  options: readonly { code: string; label: string }[];
  selectedCodes: readonly string[];
  onToggle: (code: string) => void;
}

/** SINGLE_CHOICE/MULTI_CHOICE/NUMBER가 공유하는 테두리 pill 리스트(Figma 설문 화면 기준). */
export function OptionPillList({ options, selectedCodes, onToggle }: OptionPillListProps) {
  return (
    <div className="flex flex-col gap-3">
      {options.map((option) => (
        <Toggle
          key={option.code}
          aria-label={option.label}
          className="border-gray-200"
          pressed={selectedCodes.includes(option.code)}
          variant="onboarding"
          onPressedChange={() => onToggle(option.code)}
        >
          {option.label}
        </Toggle>
      ))}
    </div>
  );
}
