/** 아직 준비되지 않은 탭 라우트의 placeholder 화면. */
export function ComingSoon({ title }: { title: string }) {
  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center gap-2 p-6">
      <h1 className="text-headline-h2-700 text-gray-900">{title}</h1>
      <p className="text-body-b2-400 text-gray-400">준비 중인 기능이에요.</p>
    </main>
  );
}
