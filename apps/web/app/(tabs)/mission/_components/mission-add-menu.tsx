import { Plus, X } from "lucide-react";
import Link from "next/link";

interface MissionAddMenuProps {
  isOpen: boolean;
  onToggle: () => void;
}

const MENU_ID = "mission-add-menu";

export function MissionAddMenu({ isOpen, onToggle }: MissionAddMenuProps) {
  return (
    <div className="fixed inset-x-0 bottom-24 z-10 mx-auto flex w-full max-w-md flex-col items-end gap-3 px-5">
      {isOpen ? (
        <div
          id={MENU_ID}
          className="flex w-[184px] flex-col gap-2 rounded-xl bg-gray-0 py-3 shadow-[0_2px_6px_rgba(35,37,41,0.15)]"
        >
          {/*
            직접입력은 구현 전이라 메뉴에 두지 않는다. 눌리지 않는 항목이 보이면 앱이
            미완성으로 읽힌다(App Store 2.1). 구현되면 추천받기 아래에 다시 넣는다.
          */}
          <Link
            className="w-full px-4 py-1 text-left text-body-b1-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            href="/mission/new"
          >
            추천받기
          </Link>
        </div>
      ) : null}
      <button
        // aria-expanded만 있으면 무엇이 펼쳐졌는지 가리키는 곳이 없다.
        aria-controls={MENU_ID}
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
