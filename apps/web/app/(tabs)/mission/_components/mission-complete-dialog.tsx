import { Button } from "@repo/ui";

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
          <Button variant="secondary" size="cta" disabled={pending} onClick={onCancel}>
            취소
          </Button>
          <Button size="cta" disabled={pending} onClick={onConfirm}>
            완료
          </Button>
        </div>
      </section>
    </div>
  );
}
