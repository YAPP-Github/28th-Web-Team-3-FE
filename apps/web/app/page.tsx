import { buttonVariants } from "@repo/ui";
import Link from "next/link";
import { NativeFeatures } from "./native-features";

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col justify-center gap-6 p-6">
      <div className="space-y-2">
        <h1 className="font-semibold text-2xl">Web Team 3</h1>
        <p className="text-muted-foreground text-sm">
          Next.js 웹 + Expo WebView 셸이 UI·스키마·API·인증을 공유합니다.
        </p>
      </div>

      <div className="flex gap-2">
        <Link href="/login" className={buttonVariants()}>
          로그인
        </Link>
      </div>

      {/* Native-only actions (share / biometric). Hidden in a plain browser. */}
      <NativeFeatures />
    </main>
  );
}
