// SVGR(@svgr/webpack)이 .svg import를 React 컴포넌트로 변환한다 (next.config.ts turbopack.rules).
declare module "*.svg" {
  import type { FC, SVGProps } from "react";

  const ReactComponent: FC<SVGProps<SVGSVGElement>>;
  export default ReactComponent;
}
