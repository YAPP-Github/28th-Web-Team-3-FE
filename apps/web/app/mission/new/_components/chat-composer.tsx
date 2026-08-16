import { Button, Input } from "@repo/ui";
import { ArrowUp } from "lucide-react";

interface ChatComposerProps {
  ariaDescribedBy?: string;
  ariaInvalid: boolean;
  disabled: boolean;
  label: string;
  maxLength: number;
  name: string;
  placeholder: string;
  value: string;
  onFocus: () => void;
  onValueChange: (value: string) => void;
}

export function ChatComposer({
  ariaDescribedBy,
  ariaInvalid,
  disabled,
  label,
  maxLength,
  name,
  placeholder,
  value,
  onFocus,
  onValueChange,
}: ChatComposerProps) {
  return (
    <div className="relative">
      <label className="sr-only" htmlFor="mission-chat-input">
        {label}
      </label>
      <Input
        aria-describedby={ariaDescribedBy}
        aria-invalid={ariaInvalid}
        autoComplete="off"
        className="h-[46px] rounded-full border-0 bg-gray-50 pr-12 text-body-b1-700 placeholder:text-gray-300 focus-visible:border-0"
        id="mission-chat-input"
        inputMode="numeric"
        maxLength={maxLength}
        name={name}
        placeholder={placeholder}
        type="text"
        value={value}
        onChange={(event) => onValueChange(event.target.value)}
        onFocus={onFocus}
      />
      <Button
        aria-label="답변 보내기"
        className="absolute top-1/2 right-2 size-[30px] -translate-y-1/2 rounded-full bg-primary p-0 text-primary-foreground hover:bg-primary/90 disabled:bg-gray-200 disabled:text-gray-900"
        disabled={disabled}
        size="icon"
        type="submit"
      >
        <ArrowUp aria-hidden="true" className="size-3.5" strokeWidth={1.8} />
      </Button>
    </div>
  );
}
