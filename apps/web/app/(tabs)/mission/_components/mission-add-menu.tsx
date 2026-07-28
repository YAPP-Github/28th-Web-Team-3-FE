import { Plus, X } from "lucide-react";
import Link from "next/link";

interface MissionAddMenuProps {
  isOpen: boolean;
  onToggle: () => void;
}

export function MissionAddMenu({ isOpen, onToggle }: MissionAddMenuProps) {
  return (
    <div className="fixed inset-x-0 bottom-24 z-10 mx-auto flex w-full max-w-md flex-col items-end gap-3 px-5">
      {isOpen ? (
        <div className="flex w-[184px] flex-col gap-2 rounded-xl bg-gray-0 py-3 shadow-[0_2px_6px_rgba(35,37,41,0.15)]">
          <Link
            className="w-full px-4 py-1 text-left text-body-b1-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            href="/mission/new"
          >
            추천받기
          </Link>
          <button
            aria-label="직접입력 (준비 중)"
            className="w-full px-4 py-1 text-left text-body-b1-500 text-gray-300"
            disabled
            type="button"
          >
            직접입력
          </button>
        </div>
      ) : null}
      <button
        aria-expanded={isOpen}
        aria-label={isOpen ? "미션 추가 메뉴 닫기" : "미션 추가 메뉴 열기"}
        className="flex size-[52px] items-center justify-center rounded-full bg-blue-500 text-gray-0 shadow-[0_2px_12px_rgba(35,37,41,0.15)] hover:bg-blue-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        type="button"
        onClick={onToggle}
      >
        {isOpen ? <X className="size-7" /> : <Plus className="size-7" />}
      </button>
    </div>
  );
}
