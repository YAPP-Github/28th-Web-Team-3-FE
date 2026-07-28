interface MissionCompleteDialogProps {
  open: boolean;
  pending?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export function MissionCompleteDialog({
  open,
  pending = false,
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
        <div className="grid w-full grid-cols-2 gap-2.5">
          <button
            className="h-[52px] rounded-xl bg-gray-50 text-body-b1-700 text-gray-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300 disabled:opacity-50"
            disabled={pending}
            type="button"
            onClick={onCancel}
          >
            취소
          </button>
          <button
            className="h-[52px] rounded-xl bg-blue-500 text-body-b1-700 text-gray-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300 disabled:opacity-50"
            disabled={pending}
            type="button"
            onClick={onConfirm}
          >
            완료
          </button>
        </div>
      </section>
    </div>
  );
}
