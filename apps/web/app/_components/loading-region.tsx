import type { ReactNode } from "react";

interface LoadingRegionProps {
  /**
   * 스크린리더가 읽을 문장. 생략하면 라이브 리전을 만들지 않는다 — 한 화면에서 여러 자리가
   * 동시에 채워질 때(홈의 목표+미션) 각자 알리면 두 번 읽힌다.
   */
  label?: string;
  className?: string;
  children: ReactNode;
}

/**
 * 조회를 기다리는 자리를 감싸는 영역.
 *
 * `aria-busy`는 여기에 쓰지 않는다. 라이브 리전에 `aria-busy="true"`는 "false가 될 때까지
 * 변경을 알리지 마라"는 뜻인데, 이 영역은 false가 되는 일 없이 그대로 사라진다 — 붙이면
 * 아무것도 안 읽힌다. 회색 블록은 `aria-hidden`이라 리전 내용이 비므로, 읽을 문장을
 * 리전 **안에** 둔다. `aria-label`은 라이브 리전의 낭독 대상이 아니다.
 */
export function LoadingRegion({ label, className, children }: LoadingRegionProps) {
  if (!label) {
    return <div className={className}>{children}</div>;
  }

  return (
    <div className={className} role="status">
      <span className="sr-only">{label}</span>
      {children}
    </div>
  );
}
