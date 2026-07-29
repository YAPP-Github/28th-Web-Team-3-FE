import { buttonVariants, cn } from "@repo/ui";
import Link from "next/link";
import { ErrorState } from "./_components/error-state";

export default function NotFound() {
  return (
    <ErrorState
      title="페이지를 찾을 수 없어요"
      description="주소가 바뀌었거나 더 이상 사용할 수 없는 화면이에요."
      action={
        <Link className={cn(buttonVariants({ size: "default" }), "min-w-30")} href="/">
          홈으로 가기
        </Link>
      }
    />
  );
}
