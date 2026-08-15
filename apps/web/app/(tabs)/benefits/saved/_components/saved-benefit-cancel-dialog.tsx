import { Button, Dialog } from "@repo/ui";

interface SavedBenefitCancelDialogProps {
  open: boolean;
  pending: boolean;
  error?: string;
  onCancel: () => void;
  onConfirm: () => void;
}

export function SavedBenefitCancelDialog({
  open,
  pending,
  error,
  onCancel,
  onConfirm,
}: SavedBenefitCancelDialogProps) {
  return (
    <Dialog
      open={open}
      title="저장을 취소할까요?"
      onOpenChange={(next) => {
        if (next || pending) return;
        onCancel();
      }}
    >
      {error ? (
        <p aria-live="polite" className="text-center text-body-b2-500 text-error">
          {error}
        </p>
      ) : null}
      <div className="grid w-full grid-cols-2 gap-2.5">
        <Button
          className="h-[52px] text-body-b1-700 text-gray-800"
          disabled={pending}
          size="cta"
          variant="secondary"
          onClick={onCancel}
        >
          아니요
        </Button>
        <Button
          className="h-[52px] text-body-b1-700"
          pending={pending}
          size="cta"
          onClick={onConfirm}
        >
          취소
        </Button>
      </div>
    </Dialog>
  );
}
