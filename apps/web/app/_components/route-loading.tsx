import { LoaderCircle } from "lucide-react";
import { LoadingRegion } from "./loading-region";

/**
 * 어느 화면으로 갈지 아직 모를 때 쓰는 대기 표시(라우트 가드).
 *
 * 여기서는 스켈레톤을 쓸 수 없다 — 목적지가 정해지기 전이라 어떤 뼈대를 깔아야 할지
 * 알 수 없고, 틀린 뼈대는 문구보다 더 어긋나 보인다.
 */
export function RouteLoading() {
  return (
    <LoadingRegion className="flex justify-center pt-20" label="불러오는 중">
      <LoaderCircle
        aria-hidden="true"
        className="size-6 animate-spin text-gray-300 motion-reduce:animate-none"
        strokeWidth={2}
      />
    </LoadingRegion>
  );
}
