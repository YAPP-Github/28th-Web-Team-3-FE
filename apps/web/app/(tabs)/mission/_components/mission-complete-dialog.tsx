import { Button } from "@repo/ui";

interface MissionCompleteDialogProps {
  open: boolean;
  pending?: boolean;
  /** 완료 처리에 실패했을 때 보여줄 문구. 다이얼로그는 열린 채로 남아 재시도할 수 있다. */
  error?: string;
  onCancel: () => void;
  onConfirm: () => void;
}

export function MissionCompleteDialog({
  open,
  pending = false,
  error,
  onCancel,
  onConfirm,
}: MissionCompleteDialogProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-dim-light px-5">
      <section
        aria-labelledby="mission-complete-dialog-title"
        aria-modal="true"
        className="flex w-full max-w-[298px] flex-col items-center gap-5 rounded-2xl bg-gray-0 p-5"
        role="dialog"
      >
        <h2
          id="mission-complete-dialog-title"
          className="text-center text-title-t2-700 text-gray-900"
        >
          미션을 완료할까요?
        </h2>
        {error ? (
          <p aria-live="polite" className="text-center text-body-b2-500 text-error">
            {error}
          </p>
        ) : null}
        {/* 다이얼로그 버튼은 퍼널 CTA(14px/500·48px)보다 크다 — 디자인 확인 전까지
            기존 모양(52px·16px/700)을 유지한다. */}
        <div className="grid w-full grid-cols-2 gap-2.5">
          <Button
            className="h-[52px] text-body-b1-700 text-gray-800"
            variant="secondary"
            size="cta"
            disabled={pending}
            onClick={onCancel}
          >
            취소
          </Button>
          <Button
            className="h-[52px] text-body-b1-700"
            size="cta"
            disabled={pending}
            onClick={onConfirm}
          >
            완료
          </Button>
        </div>
      </section>
    </div>
  );
}
