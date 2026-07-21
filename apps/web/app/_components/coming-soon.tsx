import { BottomNav } from "./bottom-nav";

/** 아직 준비되지 않은 탭 라우트의 placeholder 화면. 바텀 네비를 유지해 이동 동선이 끊기지 않게 한다. */
export function ComingSoon({ title }: { title: string }) {
  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col items-center justify-center gap-2 p-6 pb-24">
      <h1 className="text-headline-h2-700 text-gray-900">{title}</h1>
      <p className="text-body-b2-400 text-gray-400">준비 중인 기능이에요.</p>
      <BottomNav />
    </main>
  );
}
