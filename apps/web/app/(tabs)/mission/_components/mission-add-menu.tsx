import { cn } from "@repo/ui";
import { Plus } from "lucide-react";
import Link from "next/link";

interface MissionAddMenuProps {
  isOpen: boolean;
  onToggle: () => void;
}

const MENU_ID = "mission-add-menu";

export function MissionAddMenu({ isOpen, onToggle }: MissionAddMenuProps) {
  return (
    <div className="fixed inset-x-0 bottom-24 z-10 mx-auto flex w-full max-w-md flex-col items-end gap-3 px-5">
      <div
        id={MENU_ID}
        aria-hidden={!isOpen}
        className={cn(
          "flex w-[184px] origin-bottom-right flex-col gap-2 rounded-xl bg-gray-0 py-3 shadow-[0_2px_6px_rgba(35,37,41,0.15)] transition-[opacity,scale,translate] duration-200 ease-out motion-reduce:transition-none",
          isOpen
            ? "translate-y-0 scale-100 opacity-100"
            : "pointer-events-none translate-y-2 scale-95 opacity-0",
        )}
        inert={!isOpen ? true : undefined}
      >
        <Link
          className="w-full px-4 py-1 text-left text-body-b1-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          href="/mission/new"
        >
          추천받기
        </Link>
        <Link
          className="w-full px-4 py-1 text-left text-body-b1-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          href="/mission/new/manual"
        >
          직접입력
        </Link>
      </div>
      <button
        // aria-expanded만 있으면 무엇이 펼쳐졌는지 가리키는 곳이 없다.
        aria-controls={MENU_ID}
        aria-expanded={isOpen}
        aria-label={isOpen ? "미션 추가 메뉴 닫기" : "미션 추가 메뉴 열기"}
        className={cn(
          "flex size-[52px] items-center justify-center rounded-full shadow-[0_2px_12px_rgba(35,37,41,0.15)] transition-[rotate,background-color,color] duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none",
          isOpen
            ? "rotate-45 bg-gray-0 text-gray-900 hover:bg-gray-50"
            : "rotate-0 bg-blue-500 text-gray-0 hover:bg-blue-600",
        )}
        type="button"
        onClick={onToggle}
      >
        <Plus aria-hidden="true" className="size-6" />
      </button>
    </div>
  );
}
