import { ChevronRight } from "lucide-react";
import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";

/**
 * 눌린 티가 나야 한다 — 이 행들은 폭이 화면 전체라 눌러도 아무것도 안 변하면 먹은 것처럼 보인다.
 *
 * 색은 `hover:`만으로 부족하다. Tailwind v4가 `hover:`를 `@media (hover: hover)`로 감싸서
 * 터치 기기에는 아예 걸리지 않기 때문이다(`@repo/ui` Button과 같은 이유). 같은 색을
 * `active:`로도 건다. 행은 가장자리까지 닿는 넓은 면이라 크기 변화 대신 배경색으로만 알린다.
 *
 * `active:`는 `hover:`보다 한 단계 진하다. 같은 색으로 두면 hover를 지원한다고 보고하는
 * 기기(삼성 WebView처럼 터치인데 `hover: hover`로 잡히는 경우)에서 첫 탭 뒤 hover가
 * 눌린 채 남아, 두 번째부터는 회색에서 같은 회색으로 바뀌어 눌러도 아무 변화가 없다.
 * 진하기를 벌려 두면 hover가 남아 있어도 누르는 순간이 항상 보인다.
 *
 * 배경은 좌우 여백(px-5)까지 덮이도록 음수 마진으로 넓히고 그만큼 안쪽 여백을 준다 —
 * 행만 칠하면 글자 왼쪽에서 배경이 끊겨 눌린 영역이 실제보다 좁아 보인다. 화면 끝까지 닿으므로
 * 초점 테두리는 `ring-inset`으로 안쪽에 그린다 — 바깥에 그리면 좌우가 화면 밖으로 잘린다.
 */
const ROW_CLASS =
  "-mx-5 block px-5 transition-colors duration-100 hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset active:bg-gray-100 motion-reduce:transition-none";

/** 설정 행 한 줄. 높이 44px는 시안 값이자 터치 목표 최소치다. */
function RowBody({ children, trailing }: { children: ReactNode; trailing?: ReactNode }) {
  return (
    <span className="flex h-11 items-center justify-between">
      <span className="text-body-b1-500 text-gray-900">{children}</span>
      {trailing}
    </span>
  );
}

/** 내부 라우트로 이동하는 설정 행 (이용약관·개인정보처리방침). */
export function SettingLinkRow({ children, ...props }: ComponentProps<typeof Link>) {
  return (
    <Link {...props} className={ROW_CLASS}>
      <RowBody
        trailing={<ChevronRight className="size-5 text-gray-400" strokeWidth={1.6} aria-hidden />}
      >
        {children}
      </RowBody>
    </Link>
  );
}

/**
 * 액션을 실행하는 설정 행 (문의하기 — 바텀시트 열기).
 * 시안이 화살표를 두지 않았다 — 화살표는 다른 화면으로 넘어간다는 표시라 시트에는 안 맞는다.
 */
export function SettingButtonRow({ children, ...props }: ComponentProps<"button">) {
  return (
    <button type="button" className={`${ROW_CLASS} w-full text-left`} {...props}>
      <RowBody>{children}</RowBody>
    </button>
  );
}
