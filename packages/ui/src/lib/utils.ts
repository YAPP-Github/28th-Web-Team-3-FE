import { type ClassValue, clsx } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

/**
 * 디자인 토큰 타이포그래피(`text-body-b1-500` 등)는 Tailwind의 커스텀 `@utility`라
 * tailwind-merge가 기본 설정으로는 색상 클래스로 분류한다. 그러면 바로 뒤의
 * `text-gray-900`과 충돌한 것으로 보고 타이포 클래스를 통째로 지운다 — 폰트 크기·행간이
 * 조용히 사라진다. font-size 그룹으로 등록해 색상과 독립적으로 병합되게 한다.
 */
const isTypographyToken = (value: string) => /^(headline|title|body|caption)-/.test(value);

const twMerge = extendTailwindMerge({
  extend: { classGroups: { "font-size": [{ text: [isTypographyToken] }] } },
});

/** 조건부·충돌하는 Tailwind 클래스를 병합한다. shadcn 표준 헬퍼. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
