import { Button } from "@repo/ui";
import ChatPencil from "@repo/ui/svg/chat-pencil.svg";

interface ChatAnswerProps {
  label: string;
  editVisible: boolean;
  onEdit: () => void;
  onSelect: () => void;
}

export function ChatAnswer({ label, editVisible, onEdit, onSelect }: ChatAnswerProps) {
  return (
    <div className="flex w-full items-center justify-end gap-1.5">
      {editVisible ? (
        <Button
          aria-label={`${label} 답변 다시 선택하기`}
          className="relative size-6 shrink-0 bg-gray-800 p-0 text-gray-0 before:absolute before:-inset-2.5 hover:bg-gray-800/90"
          size="icon"
          variant="ghost"
          onClick={onEdit}
        >
          <ChatPencil aria-hidden="true" className="size-4" />
        </Button>
      ) : null}
      <button
        aria-label={`${label} 답변 수정 버튼 표시`}
        className="rounded-[20px] bg-primary px-3 py-2 text-right text-body-b2-500 text-primary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        type="button"
        onClick={onSelect}
      >
        {label}
      </button>
    </div>
  );
}
