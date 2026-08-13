import { LoaderCircle } from "lucide-react";
import { LoadingRegion } from "./loading-region";

/**
 * 어느 화면으로 갈지 아직 모를 때 쓰는 대기 표시(라우트 가드).
 *
 * 여기서는 스켈레톤을 쓸 수 없다 — 목적지가 정해지기 전이라 어떤 뼈대를 깔아야 할지
 * 알 수 없고, 틀린 뼈대는 문구보다 더 어긋나 보인다.
 *
 * 모양은 네이티브 셸의 부트 스피너(`apps/native/App.tsx`)와 맞춘다. 지문 잠금해제 직후
 * 셸 스피너가 걷히고 곧바로 이 스피너가 뜨는데, 사실 둘은 한 번의 대기를 나눠 진 것이다
 * — 셸이 게스트 토큰 발급을 기다리지 않고 넘기기 때문에 그 왕복을 여기서 치른다.
 * 위치·크기·색이 다르면 끝난 로딩이 또 시작된 것처럼 보여서 같은 값을 쓴다.
 * 크기 36px = RN `ActivityIndicator size="large"`.
 */
export function RouteLoading() {
  return (
    <LoadingRegion className="flex min-h-dvh items-center justify-center" label="불러오는 중">
      <LoaderCircle
        aria-hidden="true"
        className="size-9 animate-spin text-gray-300 motion-reduce:animate-none"
        strokeWidth={2}
      />
    </LoadingRegion>
  );
}
